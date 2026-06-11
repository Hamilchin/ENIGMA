import { createElement } from '../utils/createElement'
import { state } from '../state'
import { Die } from './Die'

export const Dice = () => {
  const dice = createElement('div', { className: 'dice' })

  const updateDice = () => {
    if (dice.querySelectorAll('.die').length === state.dice.length) return

    dice.innerHTML = ''
    state.dice.forEach((_die, index) => dice.append(Die(index)))
  }

  state.addUpdate('dice', updateDice)

  return dice
}
