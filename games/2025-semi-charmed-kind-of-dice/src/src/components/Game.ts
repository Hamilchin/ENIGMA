import { createElement } from '../utils/createElement'
import { state } from '../state'
import { Controls } from './Controls'
import { Menu } from './Menu'
import { Dice } from './Dice'
import { Modal } from './Modal'
import { Background } from './Background'

export const DiceGame = () => {
  const app = createElement(
    'div',
    { className: 'dice-game' },
    Dice(),
    Controls(),
    Modal(),
    Menu(),
  )
  const container = createElement(
    'div',
    { className: 'dice-game-container' },
    Background(),
    app,
  )

  const update = () => {
    app.classList.toggle('shop-mode', state.status.includes('shop'))
    app.classList.toggle('menu-mode', state.status.includes('menu'))
  }

  state.addUpdate('status', update)
  update()

  return container
}
