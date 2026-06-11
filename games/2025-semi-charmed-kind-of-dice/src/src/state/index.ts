import { dieRollTime, LAST_ROUND_NUMBER } from '../constants'
import type { IState } from '../types'
import { createState } from '../utils/createState'
import { particleSystem } from '../utils/particles'
import {
  blip,
  charmSound,
  clickSound,
  endDaySound,
  gameOverSound,
} from '../utils/sounds'
import { zzfx } from '../utils/zzfx'
import { updateDice, doRollDie, getDie, isDieBust } from './die'

const initialState = {
  dice: [],
  charms: 0,
  points: 0,
  highScore: JSON.parse(localStorage.getItem('jynx-dice-highscore') || '0'),
  pendingCharms: 0,
  pendingPoints: 0,
  muteState: 1,
  selectedDie: -1,
  round: 1,
  status: 'menu',
  isAnimating: false,
}
export let state = createState(initialState) as IState

export const doEnterShop = async () => {
  if (state.isAnimating) return

  state.isAnimating = true
  zzfx(...endDaySound)

  await startAnimateCountdown(state.pendingPoints, state.pendingCharms)
  state.isAnimating = false

  if (state.round === LAST_ROUND_NUMBER) {
    state.status = 'menu'
    zzfx(...gameOverSound)
    if (state.points > state.highScore) {
      state.highScore = state.points
      localStorage.setItem('jynx-dice-highscore', state.points.toString())
    }
    return
  }

  state.round++
  state.dice = state.dice.map((d) => ({ ...d, roll: d.sides }))
  state.status = 'shop'
}

const startAnimateCountdown = (points = 0, charms = 0) => {
  return new Promise((resolve) => {
    if (points === 0 && charms === 0) return resolve(true)

    const pointDuration = Math.min(1000 + points * 10, 3000)
    const charmDuration = Math.min(charms * 150, 1500)
    const startTime = Date.now()
    let count = 0
    const animateCountdown = () => {
      const elapsed = Date.now() - startTime
      const pointProgress = Math.min(
        (elapsed - charmDuration * 1.2) / pointDuration,
        1,
      )
      const charmProgress = Math.min(elapsed / charmDuration, 1)
      const easedProgress = 1 - Math.pow(1 - pointProgress, 1.8)

      const _points =
        Math.floor(points * easedProgress) - (points - state.pendingPoints)
      const _charms =
        Math.floor(charms * charmProgress) - (charms - state.pendingCharms)

      if (_points > 0) {
        state.points += _points
        state.pendingPoints -= _points
        if (state.pendingPoints <= 1 || points < 50 || count++ >= 5) {
          zzfx(...blip)
          count = 0
        }
      }

      if (_charms > 0) {
        state.charms += _charms
        state.pendingCharms -= _charms
        for (let i = 0; i < _charms; i++) particleSystem.removeOrbitalParticle()
        zzfx(...charmSound)
      }

      if (charmProgress >= 1 && pointProgress >= 1) {
        resolve(true)
      } else {
        requestAnimationFrame(animateCountdown)
      }
    }
    requestAnimationFrame(animateCountdown)
  })
}

export const doRoll = async () => {
  if (state.status === 'rolling') return
  zzfx(...clickSound)

  state.status = 'rolling'
  updateDice((die) => ({ ...die, roll: isDieBust(die) ? die.roll : null }))

  let j = 0
  const delay = dieRollTime / state.dice.length
  await Promise.all(
    state.dice
      .filter((die) => !isDieBust(die))
      .map(async (die) => {
        const _delay = ++j * delay
        await doRollDie(die, _delay)
      }),
  )

  const isBust = state.dice.every((d) => isDieBust(d))

  if (isBust) {
    state.pendingCharms = 0
    state.pendingPoints = 0
  }
  state.status = 'ready'
}

export const startGame = () => {
  state.charms = 3
  state.points = 0
  state.pendingCharms = 0
  state.pendingPoints = 0
  state.round = 1
  state.status = 'shop'
  state.dice = [getDie(4, 0), getDie(4, 1), getDie(4, 2)]
  state.selectedDie = -1
  state.isAnimating = false

  zzfx(...endDaySound)
}
