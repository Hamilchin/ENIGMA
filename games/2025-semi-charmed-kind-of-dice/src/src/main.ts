import { SVGS } from './constants'
import { INLINE_SVGS } from './svgs'
import { DiceGame } from './components/Game'
import { createElement } from './utils/createElement'
import { playMusic } from './utils/zzfx'

const svgs = createElement('div', { className: 'svgs hidden' }, '')

SVGS.forEach((svg) => {
  const innerHTML = INLINE_SVGS[svg]
  if (innerHTML) {
    svgs.append(createElement('div', { id: `${svg}`, innerHTML }))
  }
})

document.body.append(svgs)
document.body.append(DiceGame())

const handleFirstInteraction = () => {
  setTimeout(playMusic, 10)
  document.removeEventListener('pointerdown', handleFirstInteraction)
}

document.addEventListener('pointerdown', handleFirstInteraction)
