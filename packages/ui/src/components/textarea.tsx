import { type ComponentProps, splitProps } from "solid-js"

export interface TextareaProps extends ComponentProps<"textarea"> {
  rows?: number
}

export function Textarea(props: TextareaProps) {
  const [split, rest] = splitProps(props, ["rows", "class", "classList"])
  return (
    <textarea
      {...rest}
      data-component="textarea"
      rows={split.rows ?? 3}
      classList={{
        ...(split.classList ?? {}),
        [split.class ?? ""]: !!split.class,
      }}
    />
  )
}
