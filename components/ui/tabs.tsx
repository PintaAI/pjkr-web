"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const [activeTabBounds, setActiveTabBounds] = React.useState<DOMRect | null>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const updateActiveTabBounds = () => {
      const activeTab = listRef.current?.querySelector('[data-state="active"]')
      if (activeTab && listRef.current) {
        const listBounds = listRef.current.getBoundingClientRect()
        const tabBounds = activeTab.getBoundingClientRect()
        
        setActiveTabBounds({
          width: tabBounds.width,
          height: tabBounds.height,
          left: tabBounds.left - listBounds.left,
          top: (tabBounds.top - listBounds.top) - 5, // Move up by 1px to align properly
        } as DOMRect)
      }
    }

    // Initial update
    const timer = setTimeout(updateActiveTabBounds, 0)
    
    // Use MutationObserver to watch for data-state changes
    const observer = new MutationObserver(updateActiveTabBounds)
    if (listRef.current) {
      observer.observe(listRef.current, {
        attributes: true,
        attributeFilter: ['data-state'],
        subtree: true
      })
    }

    // Also listen for resize
    window.addEventListener('resize', updateActiveTabBounds)
    
    return () => {
      clearTimeout(timer)
      observer.disconnect()
      window.removeEventListener('resize', updateActiveTabBounds)
    }
  }, [])

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        "bg-muted/50 border border-primary/10 text-muted-foreground relative inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    >
      {/* Animated background indicator */}
      <AnimatePresence>
        {activeTabBounds && (
          <motion.div
            className="absolute bg-primary/20 rounded-md shadow-sm z-0"
            layoutId="activeTabIndicator"
            initial={false}
            animate={{
              x: activeTabBounds.left,
              y: activeTabBounds.top,
              width: activeTabBounds.width,
              height: activeTabBounds.height,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
              duration: 0.2
            }}
          />
        )}
      </AnimatePresence>
      {props.children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring hover:bg-primary/10 hover:mx-1 hover:text-primary text-foreground dark:text-muted-foreground relative z-10 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color] duration-200 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
      asChild
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.15
        }}
      >
        {props.children}
      </motion.div>
    </TabsPrimitive.Content>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
