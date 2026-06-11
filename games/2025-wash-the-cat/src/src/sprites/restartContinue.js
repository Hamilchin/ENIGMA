game.sprites.restartContinue.create = function() {
    //this.drawBoundaries = true
    this.width = 200
    this.height = 50
    this.x = 640
    // Restart
    p = game.sprites.restartContinue.cloneCreate()
    p.id = 'restart'
    p.y = 495
    p.txt = 'RESTART'
    // Continue
    p = game.sprites.restartContinue.cloneCreate()
    p.id = 'continue'
    p.y = 430
    p.txt = 'CONTINUE'
    // Play
    p = game.sprites.restartContinue.cloneCreate()
    p.id = 'play'
    p.y = 430
    p.txt = 'PLAY'
}

game.sprites.restartContinue.update = function () {
    // There is a level in local storage
    if (Number(localStorage.getItem(game.lclStorage) || '0') > 0) {
        if (this.id == 'continue') {
            this.isVisible = true
            if (this.isClicked) {
                game.songs.mainSong.playSong()
                game.curLevel = Number(localStorage.getItem(game.lclStorage))
                mge.game.changeScene(game.scenes.main)
            }
        }
        if (this.id == 'restart') {
            this.isVisible = true
            if (this.isClicked) {
                game.songs.mainSong.playSong()
                //localStorage.removeItem(game.lclStorage)
                game.curLevel = 0
                mge.game.changeScene(game.scenes.main)
            }
        }
        if (this.id == 'play') {this.isVisible = false}
    } else {
    // There is no level in local storage
        if (this.id == 'continue') {this.isVisible = false}
        if (this.id == 'restart') {this.isVisible = false}
        if (this.id == 'play') {
            this.isVisible = true
            if (this.isClicked) {
                game.songs.mainSong.playSong()
                game.curLevel = 0
                mge.game.changeScene(game.scenes.main)
            }
        }
    }
}

game.sprites.restartContinue.drawFunction = function (ctx) {
        ctx.fillStyle = game.hsl(game.mainColor,100,95)
        ctx.strokeStyle = game.hsl(game.mainColor,100,5)
        ctx.lineWidth = 3
        ctx.fillRect(0,0,this.width,this.height)
        ctx.strokeRect(0,0,this.width,this.height)
        // Text
        ctx.font = "bold 20px sans-serif"
        ctx.fillStyle = game.hsl(game.mainColor,100,5)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.txt,this.width/2,this.height/2)
}