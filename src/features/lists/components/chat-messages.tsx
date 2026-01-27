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
        <InfiniteScroll
          status={status}
          isLoading={isLoading}
          loadMore={loadMore}
          numItems={PER_PAGE}
        />
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}

function ChatMessage({ message }: { message: UIMessage }) {
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  })

  return (
    <Message from={message.role}>
      <MessageContent>
        {message.status === "streaming" ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <div className="size-2 animate-pulse rounded-full bg-primary" />
            Thinking...
          </div>
        ) : (
          visibleText && <MessageResponse>{visibleText}</MessageResponse>
        )}
      </MessageContent>
    </Message>
  )
}
