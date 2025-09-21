import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  className 
}: StatsCardProps) {
  return (
    <Card className={cn("bg-gradient-to-br from-card to-primary/5 border-primary/10", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="text-primary bg-primary/10 p-1.5 rounded-md">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}