"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type TableProps = React.ComponentProps<"table"> & {
  layout?: "auto" | "fixed"
}

function Table({ className, layout = "fixed", ...props }: TableProps) {
  return (
    <table
      data-slot="table"
      className={cn(
        "w-full min-w-0 caption-bottom text-sm",
        layout === "fixed" && "table-fixed",
        className,
      )}
      {...props}
    />
  )
}

function TableColgroup({ children }: { children: React.ReactNode }) {
  return <colgroup>{children}</colgroup>
}

function TableCol({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <col className={className} style={style} />
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-fi-sky-100/70 [&_tr]:border-b [&_tr]:border-border-subtle", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border-subtle transition-colors hover:bg-brand-blue-soft/60 data-[state=selected]:bg-muted [transition-duration:var(--motion-hover)]",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-3 py-3 text-left align-middle text-xs font-medium leading-snug tracking-wide text-text-secondary uppercase [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-3.5 align-middle text-sm text-text-primary [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableCol,
  TableColgroup,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
