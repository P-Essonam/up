"use client"

import { useEffect, useMemo } from "react"
import { useUIMessages, useSmoothText, type UIMessage } from "@convex-dev/agent/react"

import { api } from "../../../../convex/_generated/api"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { PER_PAGE } from "@/lib/constants"
import { type MessageStatus } from "../lib/types"
import { ChatToolResults } from "./chat-tool-results"

export function MessagesView({
  threadId,
  onStatusChange,
}: {
  threadId: string
  onStatusChange: (status: MessageStatus) => void
  onSuggestionClick?: (suggestion: string) => void
}) {
  const { results: messages, status, isLoading, loadMore } = useUIMessages(
    api.brain.listMessages,
    { threadId },
    { initialNumItems: PER_PAGE, stream: true }
  )

  const isStreaming = useMemo(
    () => messages.some((m) => m.status === "streaming"),
    [messages]
  )

  useEffect(() => {
    onStatusChange(isStreaming ? "streaming" : "ready")
  }, [isStreaming, onStatusChange])

  return (
    <Conversation className="size-full">
      <ConversationContent className="px-4 py-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </ConversationContent>
        <InfiniteScroll
          status={status}
          isLoading={isLoading}
          loadMore={loadMore}
          numItems={PER_PAGE}
        />
      <ConversationScrollButton />
    </Conversation>
  )
}

function ChatMessage({ message }: { message: UIMessage }) {
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  })
  
  // const [reasoningText] = useSmoothText(
  //   message.parts
  //     .filter((p) => p.type === "reasoning")
  //     .map((p) => p.text)
  //     .join("\n") ?? "",
  //   {
  //     startStreaming: message.status === "streaming",
  //   }
  // )

  const isStreaming = message.status === "streaming"

  return (
    <Message from={message.role}>
      {/* {showText && ( */}
        <MessageContent>
          {/* {reasoningText && (
          <Reasoning
            className="w-full"
            isStreaming={message.status === "streaming"}
          >
            <ReasoningTrigger />
            <ReasoningContent>{reasoningText}</ReasoningContent>
          </Reasoning>
        )} */}
          {isStreaming ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <div className="size-2 animate-pulse rounded-full bg-primary" />
              Thinking...
            </div>
          ) : (
            visibleText && <MessageResponse>{visibleText}</MessageResponse>
          )}
        </MessageContent>
      {/* )} */}
      {message.role === "assistant" && message.status !== "streaming" && (
        <ChatToolResults parts={message.parts} />
      )}
    </Message>
  )
}
