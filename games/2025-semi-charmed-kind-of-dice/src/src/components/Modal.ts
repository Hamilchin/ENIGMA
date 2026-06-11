import { state } from '../state'
import { createElement } from '../utils/createElement'
import { DieFace } from './Die'

export const Modal = () => {
  const overlay = createElement('div', { className: 'modal-overlay' })
  const modal = createElement('div', { className: 'modal' })
  const contentEl = createElement('div', { className: 'modal-content' })
  const contentNextEl = createElement('div', { className: 'modal-content' })
  const textEl = createElement('h3')
  const textNextEl = createElement('h3')

  const closeModal = () => (state.selectedDie = -1)
  const btn = createElement('button', { onclick: closeModal }, 'Close')
  const buttonsEl = createElement('div', { className: 'modal-buttons' }, btn)

  overlay.onclick = (e) => e.target === overlay && closeModal()
  modal.append(textEl, contentEl, textNextEl, contentNextEl, buttonsEl)
  overlay.appendChild(modal)

  state.addUpdate('selectedDie', () => {
    const open = state.selectedDie !== -1
    overlay.classList.toggle('open', open)
    if (!open) return

    const sides = state.dice[state.selectedDie]?.sides

    contentEl.innerHTML = ''
    for (let i = 1; i <= sides; i++) {
      const { container, update } = DieFace()
      update(null, sides, i, false, false)
      contentEl.append(container)
    }

    textEl.innerText = 'Current Level (d' + sides + ')'
    contentNextEl.innerHTML = ''
    if (sides <= 12) {
      const nextSides = sides === 12 ? 20 : sides + 2
      for (let i = 1; i <= nextSides; i++) {
        const { container, update } = DieFace()
        update(null, nextSides, i, false, false)
        contentNextEl.append(container)
      }
      textNextEl.innerText = 'Next Level (d' + nextSides + ')'
    } else {
      textNextEl.innerText = 'Max Level Reached'
    }
  })

  return overlay
}
