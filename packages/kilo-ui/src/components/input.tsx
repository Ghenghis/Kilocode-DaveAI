import { splitProps, type JSX } from "solid-js"

export interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onInput"> {
  type?: "text" | "password" | "email" | "number" | "search" | "tel" | "url"
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void
}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, ["type", "class", "onInput"])
  return (
    <input
      type={local.type ?? "text"}
      class={local.class}
      data-component="input"
      onInput={local.onInput as JSX.EventHandler<HTMLInputElement, InputEvent>}
      {...others}
    />
  )
}
