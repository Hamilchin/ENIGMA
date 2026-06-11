import { state } from '.'
import type { Die } from '../types'
import {
  blackCatSound,
  fullBustSound,
  charmSound,
  getNumberSound,
  upgradeSound,
  newDieSound,
} from '../utils/sounds'
import { zzfx } from '../utils/zzfx'
import { particleSystem } from '../utils/particles'
import { colors } from '../constants'

const charm: Record<number, number> = {
  4: 4,
  6: 6,
  8: 7,
  10: 9,
  12: 12,
  20: 21,
}

const bust: Record<number, number> = { 4: 1, 6: 1, 8: 2, 10: 2, 12: 3, 20: 5 }
export const isDieCharm = (die: { roll: number | null; sides: number }) =>
  die.roll ? die.roll >= charm[die.sides] : false

export const isDieBust = (die: { roll: number | null; sides: number }) =>
  die.roll ? die.roll <= bust[die.sides] : false

export const getDie = (sides: number, index: number) =>
  ({ sides, roll: sides, index } as Die)

export const onClickDie = (_index: number) => {
  state.selectedDie = _index
}

export const onClickUpgradeDie = (index: number) => {
  const sides = state.dice[index].sides
  if (sides >= 20) return false
  const cost = getDieUpgradeCost(sides)
  if (state.charms < cost) return

  state.charms -= cost
  upgradeDie(index)
}

export const upgradeDie = (index: number) => {
  zzfx(...upgradeSound)
  updateDice((die, i) => {
    const sides = die.sides >= 12 ? 20 : die.sides + 2
    if (i === index) return { ...die, sides, roll: sides }
    return die
  })
}

export const updateDice = (update: (die: Die, i: number) => Die) =>
  (state.dice = state.dice.map(update))

export const doRollDie = async (die: Die, delay: number) => {
  if (isDieBust(die)) return

  const app = document.querySelector('.dice-game')!
  return new Promise((resolve) =>
    setTimeout(() => {
      app.classList.remove('shake')
      const roll = rollDie(die.sides, die.index)
      state.dice = state.dice.map((d, idx) =>
        idx === die.index ? { ...d, roll } : d,
      )

      const d = { sides: state.dice[die.index].sides, roll }
      const isCharm = isDieCharm(d)
      const isBust = isDieBust(d)
      const charms = isCharm ? (d.sides >= 10 ? 3 : d.sides >= 6 ? 2 : 1) : 0
      const points = isBust || isCharm ? 0 : roll ?? 0

      state.pendingPoints += points

      const dieElement = document.querySelectorAll('.die')[
        die.index
      ] as HTMLElement
      const rect = dieElement.getBoundingClientRect()
      const x = rect.left + rect.width / 2 + (isBust ? 20 : 0)
      const y = rect.top + rect.height / 2 + (isBust ? 20 : 0)
      const color = isBust ? 'black' : isCharm ? '#f1da41' : colors[d.sides]
      const count = isCharm || isBust ? 10 : 6
      particleSystem.createConfetti(x, y, color, count, isCharm)

      if (isCharm) {
        for (let i = 0; i < charms; i++) {
          setTimeout(() => {
            zzfx(...charmSound)
            state.pendingCharms++
            particleSystem.createOrbitalParticle()
          }, i * 150)
        }
      } else if (isBust) {
        if (state.dice.every((d) => isDieBust(d))) {
          particleSystem.fireOffOrbitalParticles()
          particleSystem.createConfetti(
            particleSystem.centerX,
            particleSystem.centerY + particleSystem.centerYOffset,
            'black',
            30,
          )
          zzfx(...fullBustSound)
        } else {
          zzfx(...blackCatSound)
        }
        setTimeout(() => app.classList.add('shake'), 10)
        setTimeout(() => app.classList.remove('shake'), 200)
      } else {
        zzfx(...getNumberSound(state.pendingPoints))
      }
      resolve(undefined)
    }, delay),
  )
}

export const getDieUpgradeCost = (sides: number) =>
  sides === 20 ? 7 : sides / 2

export const getNewDieCost = () => (state.dice.length - 2) * 2
export const buyNewDie = () => {
  const cost = getNewDieCost()
  if (state.charms < cost) return
  zzfx(...newDieSound)
  state.dice = [...state.dice, getDie(4, state.dice.length)]
  state.charms -= cost
}

const pools = new Map<string, number[]>()

const shuffle = <T>(array: T[]): T[] => {
  const arr = array.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const rollDie = (sides: number, index: number) => {
  if (sides < 1) return 0
  const key = sides + '-' + index
  let pool = pools.get(key)
  if (!pool || pool.length === 0) {
    pool = []
    for (let i = 1; i <= sides; i++) pool.push(i, i, i)
    pool = shuffle(pool)
    pools.set(key, pool)
  }
  const val = pool.pop()!
  return val
}
