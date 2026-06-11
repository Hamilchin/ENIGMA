//////////////////////
// Start scene 
//////////////////////
game.scenes.boot.start = function() {
    // Load instruments
    game.instruments.init()
    // Load songs
    game.songs.init()
    // Create background
    game.background.create()
    // Create sprites
    game.sprites.button.create()
    game.sprites.cat.create()
    game.sprites.hydro.create()
    game.sprites.decoration.create()
    game.sprites.restartContinue.create()
    // Init cat
    game.sprites.cat.x = 550
    game.sprites.cat.maxX = 640
    game.sprites.cat.cleanLevel = 1
    // Green ball for introducvtion
    game.ball={x:mge.game.width/2,y:100}
    // Play song
    //game.songs.mainSong.playSong()
}

//////////////////////
// Update scene
//////////////////////
game.scenes.boot.update = function() {
    game.sprites.cat.update()
    // When cat in the center:
    if(game.sprites.cat.x >= game.sprites.cat.maxX) {
        game.sprites.cat.cleanLevel*=0.97
    }
    // When cat is dirty
    if (game.sprites.cat.cleanLevel <= 0.4) {
        game.sprites.restartContinue.cloneExecuteForEach('update')
    }
    // Force y position of cat
    game.sprites.cat.y = 300
    // Ball
    game.ball.y = Math.min(300,game.ball.y+1.5)
}

//////////////////////
// Draw scene
//////////////////////
game.scenes.boot.draw = function() {
    // Backgroud
    let ctx = mge.game.context
    ctx.fillStyle = game.hsl(game.mainColor,100,70)
    ctx.fillRect(0,0,mge.game.width,mge.game.height)
    // Ball
    ctx.fillStyle = '#008000'
    ctx.beginPath()
    ctx.arc(game.ball.x, game.ball.y,9,0,2*Math.PI)
    ctx.fill()
    // Sprites & title
    game.sprites.cat.draw()
    // Title 'T'
    ctx.font = "bold 150px sans-serif"
    ctx.fillStyle = '#008000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('T',mge.game.width/2,150)
    // Title other letters
    let a = 1-game.sprites.cat.cleanLevel
    ctx.fillStyle = 'rgba(0,0,0,'+a+')'
    ctx.fillText('WASH    HE CAT',mge.game.width/2+20,150)
    // JS13
    ctx.font = "italic bold 40px sans-serif"
    ctx.fillStyle = 'black'
    ctx.fillText('A game created for JS13K 2025 challenge',mge.game.width/2,610)
    // Homer Dilpleu
    ctx.font = "italic bold 20px sans-serif"
    ctx.fillText('by Homer Dilpleu',mge.game.width/2,650)
    if (game.sprites.cat.cleanLevel <= 0.4) {
        // Buttons
        game.sprites.restartContinue.cloneExecuteForEach('draw')
    }
}