export type Die = {
  sides: number
  index: number
  roll: number | null
}

export interface IState extends State {
  dice: Die[]
  points: number
  highScore: number
  selectedDie: number
  charms: number
  pendingCharms: number
  pendingPoints: number
  round: number
  muteState: number
  isAnimating: boolean
  status: 'ready' | 'rolling' | 'shop' | 'menu'
}

export type DeepHTMLElement = HTMLElement & { [key: string]: unknown }
export type Tag =
  | 'a'
  | 'br'
  | 'button'
  | 'canvas'
  | 'dialog'
  | 'div'
  | 'form'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'head'
  | 'header'
  | 'hr'
  | 'html'
  | 'img'
  | 'input'
  | 'label'
  | 'li'
  | 'main'
  | 'meta'
  | 'nav'
  | 'option'
  | 'p'
  | 'pre'
  | 'script'
  | 'section'
  | 'select'
  | 'span'
  | 'strong'
  | 'style'
  | 'svg'
  | 'table'
  | 'tbody'
  | 'td'
  | 'textarea'
  | 'th'
  | 'thead'
  | 'title'
  | 'ul'
  | 'video'

export type State = Record<string, unknown> & {
  _updates: Record<string, Array<() => void>>
  _update: (s: string) => void
  addUpdate: (s: string, u: () => void) => void
}
export type StateProxy = {
  [key: string]: unknown
  _updates: Record<string, Array<() => void>>
  _update: (s: string) => void
  addUpdate: (s: string, u: () => void) => void
}
