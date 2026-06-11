import { createElement } from '../utils/createElement'
import { startGame, state } from '../state'
import { toggleMute } from '../utils/zzfx'

export const Menu = () => {
  const btnStart = createElement('button', 'Start Game') as HTMLButtonElement
  const btnMute = createElement('button') as HTMLButtonElement
  const title = createElement('h2')
  title.innerHTML = 'Semi-Charmed<br/>Kind of Dice'

  const credits = createElement('div', 'By Daniel Whiffing')
  const lastScore = createElement('div')
  const highScore = createElement('div')
  const buttons = createElement(
    'div',
    { className: 'buttons' },
    btnStart,
    btnMute,
  )

  const container = createElement(
    'div',
    { className: 'menu' },
    title,
    credits,
    lastScore,
    highScore,
    buttons,
  )

  const update = () => {
    const visible = state.status !== 'menu'
    container.style.opacity = visible ? '0' : '1'
    container.style.pointerEvents = visible ? 'none' : 'auto'
    credits.style.marginBottom = '10px'
    highScore.textContent = 'High Score: ' + state.highScore
    lastScore.textContent = 'Last Score: ' + state.points
    highScore.style.display = state.highScore ? 'block' : 'none'
    lastScore.style.display = state.points ? 'block' : 'none'
    btnMute.textContent =
      state.muteState === 0
        ? 'Muted'
        : state.muteState === 2
        ? 'Music off'
        : 'Sound/Music on'
  }

  btnStart.onclick = () => startGame()
  btnMute.onclick = () => toggleMute()

  state.addUpdate('points', update)
  state.addUpdate('highScore', update)
  state.addUpdate('muteState', update)
  state.addUpdate('status', update)
  update()

  return container
}
