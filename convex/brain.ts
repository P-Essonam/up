import {
    Agent,
    getThreadMetadata,
    listUIMessages,
    stepCountIs,
    syncStreams,
    vStreamArgs,
    type ToolCtx,
} from "@convex-dev/agent"
import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { components, internal } from "./_generated/api"
import { mutation, query, internalAction, action, internalQuery } from "./_generated/server"
import { getOrganizationId, getUserId } from "./auth"
import { tools } from "./tools"
import z from "zod/v3"

export type BrainCtx = ToolCtx & {
    organizationId: string
}

const instructions = `You are Brain, an AI assistant for this project management workspace.

## Data Model
- **Spaces** contain **Lists**, and **Lists** contain **Tasks**
- Use available tools as needed; combine calls when one tool's output is required by another

## Tools

**Spaces:**
- listSpaces: Get all spaces
- getSpace: Get space by ID
- findSpaceByName: Search space by name (returns array)
- createSpace: Create space (needs name, color, icon)
- updateSpace: Update space properties

**Lists:**
- listListsBySpace: Get lists in a space
- getList: Get list by ID
- findListByName: Search list by name (returns array)
- createList: Create list in a space
- updateList: Update list or move to another space

**Tasks:**
- listTasks: Get tasks from a list (can filter by status)
- getTask: Get task by ID
- findTask: Search task by title (returns array)
- createTask: Create task (defaults to status='todo')
- updateTask: Update any task property

## Colors
Tailwind classes: bg-violet-500, bg-indigo-500, bg-blue-500, bg-sky-500, bg-teal-500, bg-emerald-500, bg-green-500, bg-amber-500, bg-orange-500, bg-red-500, bg-rose-500, bg-pink-500, bg-fuchsia-500, bg-stone-500

## Icons
Lucide icons (PascalCase): Folder, Rocket, Star, Home, Settings, Users, Calendar, FileText, Code, Briefcase, Heart, Zap, Target, Flag, BookOpen, Camera, Music, Mail, etc.

## Rules
1. Always use tools - never fabricate IDs or data
2. When user mentions a name, use find* tools to search, then use the ID from results
3. If find* returns multiple results, show them and ask user to choose
4. If result is null or empty array, inform user
5. Be concise after mutations`



export const brainAgent = new Agent<BrainCtx>(components.agent, {
    name: "Brain",
    languageModel: "anthropic/claude-sonnet-4.5",
    instructions,
    tools,
    stopWhen: stepCountIs(10),
    callSettings: {
        maxRetries: 10,
    },
    // Debugging tools
    rawRequestResponseHandler: async (ctx, { request, response }) => {
        console.log("response", response);
        console.log("================================================");
    },
})

export const sendMessage = mutation({
    args: {
        prompt: v.string(),
        threadId: v.optional(v.string()),
        spaceId: v.optional(v.id("spaces")),
        listId: v.optional(v.id("lists")),
    },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx)
        const organizationId = await getOrganizationId(ctx)

        // Get existing thread or create new one
        let threadId = args.threadId
        if (!threadId) {
            const { threadId: newId } = await brainAgent.createThread(ctx, { userId })
            threadId = newId

            // Set as current thread
            const existing = await ctx.db
                .query("currentThreads")
                .withIndex("by_userId", (q) => q.eq("userId", userId))
                .first()

            if (existing) {
                await ctx.db.patch(existing._id, { threadId })
            } else {
                await ctx.db.insert("currentThreads", { threadId, userId })
            }
        }

        // Save message and start streaming
        const { messageId } = await brainAgent.saveMessage(ctx, {
            threadId,
            prompt: args.prompt,
            skipEmbeddings: true,
        })

        await ctx.scheduler.runAfter(0, internal.brain.streamAsync, {
            threadId,
            promptMessageId: messageId,
            spaceId: args.spaceId,
            listId: args.listId,
            organizationId,
        })

        // Generate title for new threads
        const details = await ctx.runQuery(internal.brain.getThreadDetails, { threadId })
        if (!details?.title || !details?.summary) {
            await ctx.scheduler.runAfter(0, internal.brain.updateThreadTitle, { threadId, organizationId })
        }

        return { threadId }
    },
})



export const streamAsync = internalAction({
    args: {
        promptMessageId: v.string(),
        threadId: v.string(),
        spaceId: v.optional(v.id("spaces")),
        listId: v.optional(v.id("lists")),
        organizationId: v.string(),
    },
    handler: async (ctx, { promptMessageId, threadId, spaceId, listId, organizationId }) => {
        // Build context messages array
        const contextMessages: { role: "user"; content: string }[] = []
        let contextContent = ""

        // Provide minimal scope guidance based on provided IDs
        if (spaceId || listId) {
            contextContent = `
        WORKSPACE CONTEXT:
        ${spaceId ? `Space ID: ${spaceId}` : ""}
        ${listId ? `List ID: ${listId}` : ""}

        IMPORTANT:
        1. Use the provided ID(s) directly when calling tools - do not search by name.
        2. Keep actions scoped to the specified ${spaceId && listId ? "space and list" : listId ? "list" : "space"} unless explicitly asked otherwise.
      `.trim()
        } else {
            contextContent = `
        WORKSPACE CONTEXT:
        Scope: Entire workspace

        IMPORTANT:
        1. Ask clarifying questions to identify which space or list the user means.
        2. Once identified, focus actions on that scope.
      `.trim()
        }

        // Add context message if we have content
        if (contextContent.trim() !== "") {
            contextMessages.push({
                role: "user",
                content: contextContent,
            })
        }

        const result = await brainAgent.streamText(
            { ...ctx, organizationId },
            { threadId },
            {
                promptMessageId,
                ...(contextMessages.length > 0 ? { messages: contextMessages } : {}),
            },
            {
                saveStreamDeltas: { chunking: "word", throttleMs: 100 },
            }
        )
        await result.consumeStream()
    },
})

export const listMessages = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
        streamArgs: vStreamArgs,
    },
    handler: async (ctx, args) => {
        await getOrganizationId(ctx)

        const { threadId, streamArgs } = args

        const streams = await syncStreams(ctx, components.agent, {
            threadId,
            streamArgs,
        })

        const paginated = await listUIMessages(ctx, components.agent, args)

        return { ...paginated, streams }
    },
})

export const listThreads = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const user_id = await getUserId(ctx)
        return await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
            userId: user_id,
            order: "desc",
            paginationOpts: args.paginationOpts,
        })
    },
})

export const setCurrentThread = mutation({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const user_id = await getUserId(ctx)

        // Upsert current thread for this user
        const existing = await ctx.db
            .query("currentThreads")
            .withIndex("by_userId", (q) => q.eq("userId", user_id))
            .first()

        if (existing) {
            await ctx.db.patch(existing._id, { threadId: args.threadId })
        } else {
            await ctx.db.insert("currentThreads", {
                threadId: args.threadId,
                userId: user_id,
            })
        }
    },
})

export const getCurrentThread = query({
    handler: async (ctx) => {
        const user_id = await getUserId(ctx)
        const current = await ctx.db
            .query("currentThreads")
            .withIndex("by_userId", (q) => q.eq("userId", user_id))
            .first()
        return current?.threadId ?? null
    },
})



export const getThreadDetails = internalQuery({
    args: { threadId: v.string() },
    handler: async (ctx, { threadId }) => {
        const { title, summary } = await getThreadMetadata(ctx, components.agent, {
            threadId,
        });
        return { title, summary };
    },
});

export const updateThreadTitle = internalAction({
    args: { threadId: v.string(), organizationId: v.string() },
    handler: async (ctx, { threadId, organizationId }) => {
        const { thread } = await brainAgent.continueThread({ ...ctx, organizationId }, { threadId });
        const {
            object: { title, summary },
        } = await thread.generateObject(
            {
                schemaDescription:
                    "Generate a title and summary for the thread. The title should be a single sentence that captures the main topic of the thread. The summary should be a short description of the thread that could be used to describe it to someone who hasn't read it.",
                schema: z.object({
                    title: z.string().describe("The new title for the thread"),
                    summary: z.string().describe("The new summary for the thread"),
                }),
                prompt: "Generate a title and summary for this thread.",
            },
            { storageOptions: { saveMessages: "none" } },
        );
        await thread.updateMetadata({ title, summary });
    },
});



export const renameThread = action({
    args: {
        threadId: v.string(),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        await getUserId(ctx)
        const organizationId = await getOrganizationId(ctx)
        const { thread } = await brainAgent.continueThread({ ...ctx, organizationId }, { threadId: args.threadId })
        await thread.updateMetadata({ title: args.title })
    },
})

export const deleteThread = mutation({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx)
        const current = await ctx.db
            .query("currentThreads")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first()

        if (current?.threadId === args.threadId) {
            await ctx.db.delete(current._id)
        }

        await brainAgent.deleteThreadAsync(ctx, { threadId: args.threadId })
    },
})