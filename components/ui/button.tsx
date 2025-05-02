import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black border-slate-200 border-2 border-b-4 active:border-b-2 hover:bg-slate-100 text-slate-500",
        primary:
          "bg-cyan-400 text-primary-foreground hover:bg-cyan-400/90 border-cyan-500 border-b-4 active:border-b-0",
        primaryOutline: "bg-white text-cyan-500 hover:bg-slate-100",
        secondary:
          "bg-purple-500 text-primary-foreground hover:bg-purple-500/90 border-purple-600 border-b-4 active:border-b-0",

        secondaryOutline: "bg-white text-purple-500 hover:bg-slate-100",
        destructive:
          "bg-rose-500 text-primary-foreground hover:bg-rose-500/90 border-rose-600 border-b-4 active:border-b-0",
        destructiveOutline: "bg-white text-rose-500 hover:bg-slate-100",
        super:
          "bg-orange-500 text-primary-foreground hover:bg-orange-500/90 border-orange-600 border-b-4 active:border-b-0",

        superOutline: "bg-white text-orange-500 hover:bg-slate-100",
        ghost:
          "bg-transparent text-slate-500 border-transparent border-0 hover:bg-slate-100",
        sidebar:
          "bg-transparent text-slate-500 border-2 border-transparent hover:bg-slate-100 transition-none",
        sidebarOutline:
          "bg-cyan-500/15 text-cyan-500  border-cyan-300 border-2 hover:bg-cyan-500/200 transition-none",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 px-6 has-[>svg]:px-4",
        icon: "size-10",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
