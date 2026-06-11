export const enum GameState {
    Game,
    GameWin,
    GameOver,
}

export const game = {
    state: GameState.Game,
    timout: 0,
}