import type React from "react"

/**
 * shadcn/ui Chart component stub.
 *
 * This file previously imported recharts eagerly, pulling ~410 kB into the
 * initial bundle. Since no component in the app uses these wrappers (charts
 * are rendered via @/components/charts/* lazy wrappers), the recharts import
 * has been removed. If you need ChartContainer / ChartTooltip / etc. in the
 * future, re-add `import * as RechartsPrimitive from "recharts"` and restore
 * the original shadcn chart.tsx from the git history.
 */

export type ChartConfig = Record<string, {
  label?: React.ReactNode
  icon?: React.ComponentType
  color?: string
  theme?: Record<string, string>
}>
