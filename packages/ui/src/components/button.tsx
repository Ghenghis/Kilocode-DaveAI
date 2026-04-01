import { Button as Kobalte } from "@kobalte/core/button"
import { type ComponentProps, Show, splitProps } from "solid-js"
import { Icon, IconProps } from "./icon"

export interface ButtonProps
  extends ComponentProps<typeof Kobalte>, Pick<ComponentProps<"button">, "class" | "classList" | "children"> {
  size?: "small" | "normal" | "large" | "sm"
  variant?: "primary" | "secondary" | "ghost" | "outline" | "default" | "destructive"
  icon?: IconProps["name"]
}

export function Button(props: ButtonProps) {
  const [split, rest] = splitProps(props, ["variant", "size", "icon", "class", "classList"])
  const size = () => {
    const s = split.size || "normal"
    if (s === "sm") return "small"
    return s
  }
  return (
    <Kobalte
      {...rest}
      data-component="button"
      data-size={size()}
      data-variant={split.variant || "secondary"}
      data-icon={split.icon}
      classList={{
        ...(split.classList ?? {}),
        [split.class ?? ""]: !!split.class,
      }}
    >
      <Show when={split.icon}>
        <Icon name={split.icon!} size="small" />
      </Show>
      {props.children}
    </Kobalte>
  )
}
