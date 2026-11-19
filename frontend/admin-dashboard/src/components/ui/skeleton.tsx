import * as React from 'react'

export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#6D071A]/10 border border-[#6D071A]/15 ${className}`}
      {...props}
    />
  )
}
