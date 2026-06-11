import { createElement } from '../utils/createElement'
import { colors, dieRollTime } from '../constants'
import { state } from '../state'
import {
  getDieUpgradeCost,
  isDieBust,
  isDieCharm,
  onClickDie,
  onClickUpgradeDie,
} from '../state/die'

export const Die = (index: number) => {
  const container = createElement('div', { className: 'die-container' })
  const upgradeButton = createElement(
    'button',
    { className: 'die-upgrade', onclick: () => onClickUpgradeDie(index) },
    'Upgrade',
  )

  const dieFace = DieFace()

  container.append(dieFace.container, upgradeButton)

  const update = () => {
    const _die = state.dice[index]
    if (!_die) return

    const isUpgradeButtonHidden = state.status !== 'shop'
    const upgradeCost = getDieUpgradeCost(_die.sides)
    const upgradeLabel =
      _die.sides === 20
        ? 'Upgrade -<br/>Max Level'
        : 'Upgrade -<br/>' + upgradeCost + ' Charms'

    dieFace.update(
      () => state.status.match(/ready|shop/) && onClickDie(index),
      _die.sides,
      _die.roll,
      state.status === 'rolling' && _die.roll == null,
      state.selectedDie === index,
    )

    upgradeButton.toggleAttribute(
      'disabled',
      state.charms < upgradeCost || _die.sides >= 20,
    )
    upgradeButton.classList.toggle('hidden', isUpgradeButtonHidden)
    upgradeButton.innerHTML = upgradeLabel
  }

  state.addUpdate('dice', update)
  state.addUpdate('charms', update)
  state.addUpdate('status', update)
  state.addUpdate('selectedDie', update)
  update()

  return container
}

export const DieFace = () => {
  const number = createElement('div', { className: 'die-number' })
  const catSvg = document.querySelector('#cat svg')!.cloneNode(true)
  const charmSvg = document.querySelector('#charm svg')!.cloneNode(true)
  const charm2Svg = document.querySelector('#charm-2 svg')!.cloneNode(true)
  const charm3Svg = document.querySelector('#charm-3 svg')!.cloneNode(true)
  const dieSvg = createElement('svg')

  const container = createElement('div', { className: 'die' })
  container.append(number, catSvg, charmSvg, charm2Svg, charm3Svg, dieSvg)

  let lastSides = -1
  const update = (
    onClick: (() => void) | null,
    sides = 4,
    roll: number | null = 1,
    isRolling = false,
    isSelected = false,
  ) => {
    container.style.color = colors[sides]
    container.classList.remove('d4', 'd6', 'd8', 'd10', 'd12', 'd20')
    container.classList.add('d' + sides)
    container.classList.toggle('clickable', !!state.status.match(/ready|shop/))
    container.classList.toggle('rolling', isRolling)
    container.classList.toggle('selected', isSelected)
    container.classList.toggle('die-number-cat', isDieBust({ roll, sides }))
    container.classList.toggle('die-number-charm', isDieCharm({ roll, sides }))
    container.style.animationDuration = dieRollTime / state.dice.length + 'ms'
    number.textContent = roll ? roll + '' : ''

    if (lastSides !== sides) {
      const _dieSvg = document
        .querySelector('#d' + sides + ' svg')!
        .cloneNode(true) as SVGSVGElement
      lastSides = sides
      dieSvg.innerHTML = ''
      dieSvg.append(_dieSvg)
      if (_dieSvg.querySelector('.face')) {
        // @ts-ignore
        _dieSvg.querySelector('.face')!.onclick = onClick
      }
    }
  }

  return { container, update }
}
