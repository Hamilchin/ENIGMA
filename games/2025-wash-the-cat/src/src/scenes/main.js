//////////////////////
// Start scene 
//////////////////////
game.scenes.main.start = function() {
    // Start curlevel
    game.background.generate()
    game.loadLevel(game.curLevel)
}

//////////////////////
// Update scene
//////////////////////
game.scenes.main.update = function() {
    // Get level state
    game.getLevelState()
    // Update sprites
    game.sprites.decoration.cloneExecuteForEach('update')
    if (!game.isPaused) {
        game.sprites.cat.update()
        game.sprites.hydro.update()
    }
    game.sprites.button.cloneExecuteForEach('update')
    // Update local storge if nneded
    if(game.levelState=='won'){localStorage.setItem(game.lclStorage, Math.max(game.curLevel,Number(localStorage.getItem(game.lclStorage)))) }
}

//////////////////////
// Draw scene
//////////////////////
game.scenes.main.draw = function() {
    // Draw backgroun
    game.background.draw()
    // Draw hydraulic components
    game.sprites.hydro.drawMode = 'pipe'
    game.sprites.hydro.cloneExecuteForEach('draw')
    game.sprites.hydro.drawMode = 'other'
    game.sprites.hydro.cloneExecuteForEach('draw')
    game.sprites.hydro.drawMode = 'distributor'
    game.sprites.hydro.cloneExecuteForEach('draw')
    // Draw sprites
    game.sprites.decoration.cloneExecuteForEach('draw')
    game.sprites.button.cloneExecuteForEach('draw')
    game.sprites.cat.draw()
}