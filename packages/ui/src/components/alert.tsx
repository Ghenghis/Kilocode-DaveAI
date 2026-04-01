import { type ComponentProps, splitProps, Show, type ParentProps } from "solid-js"
import { Icon } from "./icon"

export interface AlertProps extends ComponentProps<"div"> {
  variant?: "info" | "warning" | "error" | "success"
  title?: string
  description?: string
}

export function Alert(props: AlertProps) {
  const [split, rest] = splitProps(props, ["variant", "title", "description", "class", "classList", "children"])
  const variantIcon = () => {
    switch (split.variant) {
      case "warning":
        return "alert-triangle"
      case "error":
        return "x-circle"
      case "success":
        return "check-circle"
      case "info":
      default:
        return "info"
    }
  }
  return (
    <div
      {...rest}
      data-component="alert"
      data-variant={split.variant || "info"}
      classList={{
        ...(split.classList ?? {}),
        [split.class ?? ""]: !!split.class,
      }}
    >
      <div data-slot="alert-icon">
        <Icon name={variantIcon()} size="small" />
      </div>
      <div data-slot="alert-content">
        <Show when={split.title}>
          <div data-slot="alert-title">{split.title}</div>
        </Show>
        <Show when={split.description || split.children}>
          <div data-slot="alert-description">{split.description || split.children}</div>
        </Show>
      </div>
    </div>
  )
}

// AlertDescription component for use as a child of Alert
export function AlertDescription(props: ParentProps<ComponentProps<"div">>) {
  const [split, rest] = splitProps(props, ["class", "classList", "children"])
  return (
    <div
      {...rest}
      data-slot="alert-description"
      classList={{
        ...(split.classList ?? {}),
        [split.class ?? ""]: !!split.class,
      }}
    >
      {split.children}
    </div>
  )
}
