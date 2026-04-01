import { type ComponentProps, splitProps } from "solid-js"

export interface InputProps extends ComponentProps<"input"> {
  type?: "text" | "email" | "password" | "number" | "search" | "tel" | "url"
}

export function Input(props: InputProps) {
  const [split, rest] = splitProps(props, ["type", "class", "classList"])
  return (
    <input
      {...rest}
      data-component="input"
      type={split.type || "text"}
      classList={{
        ...(split.classList ?? {}),
        [split.class ?? ""]: !!split.class,
      }}
    />
  )
}
