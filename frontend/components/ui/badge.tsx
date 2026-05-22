import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // shadcn/base defaults
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",

        // NATIF workflow badges
        "workflow-draft": "bg-[#f1f5f9] text-[#475569]",
        "workflow-submitted": "bg-[#fffbeb] text-[#d97706]",
        "workflow-received": "bg-[#ecfeff] text-[#0891b2]",
        "workflow-assigned": "bg-[#eef2ff] text-[#4f46e5]",
        "workflow-preliminary_review": "bg-[#faf5ff] text-[#7c3aed]",
        "workflow-expert_review": "bg-[#fff1f2] text-[#e11d48]",
        "workflow-summarized": "bg-[#fef3c7] text-[#b45309]",
        "workflow-dept_approved": "bg-[#dcfce7] text-[#16a34a]",
        "workflow-dept_rejected": "bg-[#fee2e2] text-[#dc2626]",

        // NATIF role badges
        "role-admin": "bg-[#dbeafe] text-[#1d4ed8]",
        "role-moderator": "bg-[#e0e7ff] text-[#4338ca]",
        "role-enterprise": "bg-[#dcfce7] text-[#16a34a]",
        "role-expert": "bg-[#fef3c7] text-[#b45309]",
        "role-officer": "bg-[#ecfeff] text-[#0891b2]",
        "role-dept_head": "bg-[#f3e8ff] text-[#7c3aed]",
        "role-director": "bg-[#fee2e2] text-[#dc2626]",
        "role-clerk": "bg-[#f1f5f9] text-[#475569]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
