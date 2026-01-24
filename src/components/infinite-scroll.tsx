"use client"

import { useEffect } from "react"
import { Loader } from "lucide-react"

import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

interface InfiniteScrollProps {
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted"
  isLoading: boolean
  loadMore: (numItems: number) => void
  numItems?: number
}

export function InfiniteScroll({
  status,
  isLoading,
  loadMore,
  numItems = 20,
}: InfiniteScrollProps) {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  })

  useEffect(() => {
    if (isIntersecting && status === "CanLoadMore" && !isLoading) {
      loadMore(numItems)
    }
  }, [isIntersecting, status, isLoading, loadMore, numItems])

  return (
    <div className="flex w-full flex-col items-center">
      <div ref={targetRef} className="h-1" />
      {status === "LoadingMore" && (
        <div className="flex w-full items-center justify-center py-2">
          <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
