import type { DeepHTMLElement, Tag } from '../types'

export const createElement = (
  tag: Tag,
  ...args: (Record<string, unknown> | HTMLElement | string)[]
) => {
  const props =
    typeof args[0] === 'object' && !(args[0] instanceof HTMLElement)
      ? (args.shift() as Record<string, unknown>)
      : null
  const elm = document.createElement(tag)
  if (props) assignDeep(elm as DeepHTMLElement, props)
  elm.append(...args.map((a) => a as Node))
  return elm
}

const assignDeep = (elm: DeepHTMLElement, props: Record<string, unknown>) =>
  Object.entries(props).forEach(([key, value]) => {
    if (typeof value === 'object' && key in elm) {
      return assignDeep(
        (elm as DeepHTMLElement)[key] as DeepHTMLElement,
        value as Record<string, unknown>,
      )
    }
    Object.assign(elm, { [key]: value })
  })
