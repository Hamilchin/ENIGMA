import { createElement } from '../utils/createElement'
import { doEnterShop, doRoll, startGame, state } from '../state'
import { buyNewDie, getNewDieCost, isDieBust } from '../state/die'
import { MAX_DICE } from '../constants'
import { toggleMute } from '../utils/zzfx'
import { particleSystem } from '../utils/particles'

export const Controls = () => {
  const btnRoll = createElement('button', '') as HTMLButtonElement
  const btnShop = createElement('button', '') as HTMLButtonElement
  const roundCount = createElement('div', { className: 'round-count' })
  const charmCount = createElement('div', { className: 'charm-count' })
  const pointCount = createElement('div', { className: 'chip-count' })
  const gameButtons = createElement(
    'div',
    { className: 'buttons' },
    btnShop,
    btnRoll,
  )
  const info = createElement(
    'div',
    { className: 'info' },
    roundCount,
    charmCount,
    pointCount,
  )
  const container = createElement(
    'div',
    { className: 'controls' },
    info,
    gameButtons,
  )

  const update = () => {
    const rollDisabled =
      state.isAnimating || !!state.status.match(/rolling|menu/)
    const isBust = state.dice.every(isDieBust)
    btnRoll.toggleAttribute('disabled', rollDisabled)
    btnRoll.textContent = isBust
      ? 'End Day'
      : state.status === 'shop'
      ? 'Start Day'
      : 'Roll'
    btnRoll.style.flex = '1'

    btnShop.toggleAttribute(
      'disabled',
      state.isAnimating ||
        (state.status === 'shop'
          ? state.charms < getNewDieCost() || state.dice.length >= MAX_DICE
          : state.status !== 'ready'),
    )
    btnShop.style.display =
      isBust || (state.status === 'shop' && state.dice.length >= MAX_DICE)
        ? 'none'
        : 'block'
    btnShop.innerHTML =
      state.status === 'shop'
        ? state.dice.length >= MAX_DICE
          ? ''
          : `Buy Die -<br/>${getNewDieCost()} Charms`
        : 'End Day'

    btnRoll.onclick = isBust ? doEnterShop : doRoll
    btnShop.onclick = state.status === 'shop' ? buyNewDie : doEnterShop

    particleSystem.pointCount = state.pendingPoints

    const game = document.querySelector('.dice-game')
    const height = game?.getBoundingClientRect().height ?? 0
    const mobileOffset = innerHeight / 2 - height - 150
    particleSystem.centerYOffset =
      innerWidth < 500 ? mobileOffset : state.dice.length > 4 ? -210 : -105

    roundCount.innerHTML = ''
    charmCount.innerHTML = ''
    pointCount.innerHTML = ''

    roundCount.append(
      createElement('div', {}, `${state.round}`),
      createElement('div', {}, `DAY`),
    )
    charmCount.append(
      createElement(
        'div',
        {},
        `${state.charms}${
          state.status === 'shop' ? '' : ` + ${state.pendingCharms}`
        }`,
      ),
      createElement('div', {}, `CHARMS`),
    )
    pointCount.append(
      createElement(
        'div',
        {},
        `${state.points}${
          state.status === 'shop' ? '' : ` + ${state.pendingPoints}`
        }`,
      ),
      createElement('div', {}, `POINTS`),
    )
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault()
      if (state.status === 'menu') return startGame()
      if (!btnRoll.hasAttribute('disabled')) btnRoll.click()
    }
    if (event.code === 'Enter' && !btnShop.hasAttribute('disabled')) {
      event.preventDefault()
      btnShop.click()
    }
    if (event.code === 'KeyM') toggleMute()
  }
  document.addEventListener('keydown', handleKeyPress)

  state.addUpdate('status', update)
  state.addUpdate('points', update)
  state.addUpdate('charms', update)
  state.addUpdate('pendingCharms', update)
  state.addUpdate('pendingPoints', update)
  state.addUpdate('isAnimating', update)
  state.addUpdate('dice', update)
  update()

  return container
}
