"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  userId?: string
  clickable?: boolean
}

function Avatar({
  className,
  userId,
  clickable = false,
  ...props
}: AvatarProps) {
  const router = useRouter()

  const handleClick = () => {
    if (clickable && userId) {
      router.push(`/profile/${userId}`)
    }
  }

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        clickable && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full uppercase",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
