import { type ComponentProps, splitProps } from "solid-js"

export interface LabelProps extends ComponentProps<"label"> {
  htmlFor?: string
}

export function Label(props: LabelProps) {
  const [split, rest] = splitProps(props, ["htmlFor", "class", "classList", "children"])
  return (
    <label
      {...rest}
      data-component="label"
      for={split.htmlFor}
      classList={{
        ...(split.classList ?? {}),
        [split.class ?? ""]: !!split.class,
      }}
    >
      {split.children}
    </label>
  )
}
