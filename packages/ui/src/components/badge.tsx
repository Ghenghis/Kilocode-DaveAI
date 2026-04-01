import { type ComponentProps, splitProps } from "solid-js"

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: "default" | "secondary" | "outline"
}

export function Badge(props: BadgeProps) {
  const [split, rest] = splitProps(props, ["variant", "class", "classList", "children"])
  return (
    <span
      {...rest}
      data-component="badge"
      data-variant={split.variant || "default"}
      classList={{
        ...(split.classList ?? {}),
        [split.class ?? ""]: !!split.class,
      }}
    >
      {split.children}
    </span>
  )
}
