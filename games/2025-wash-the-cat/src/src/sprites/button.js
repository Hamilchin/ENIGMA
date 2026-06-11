game.sprites.button.create = function() {
    //this.drawBoundaries = true

    // Restart Button
    p = game.sprites.button.cloneCreate()
    p.id = 'restart'
    p.width = 50
    p.height = 50
    p.x = 200
    p.y = 600
    p.svg = new Path2D('M16 12 A17 17 0 1 0 34 12 L30 20 M34 12 L45 15')

    // Pause Button
    p = game.sprites.button.cloneCreate()
    p.id = 'pause'
    p.width = 50
    p.height = 50
    p.x = 260
    p.y = 600
    p.svgPlay = new Path2D('M10 10 L40 25 L10 40 L10 10')
    p.svgPause = new Path2D('M20 12 L20 40 M30 12 L30 40')

    // Audio Button
    p = game.sprites.button.cloneCreate()
    p.id = 'audio'
    p.width = 50
    p.height = 50
    p.x = 320
    p.y = 600
    p.svgOn = new Path2D('M7 20 L7 30 L15 30 L30 40 L30 10 L15 20 L7 20 M37 15 L37 35 M44 10 L44 40')
    p.svgOff = new Path2D('M7 20 L7 30 L15 30 L30 40 L30 10 L15 20 L7 20 M37 20 L44 30 M44 20 L37 30')

    // Next level Button
    p = game.sprites.button.cloneCreate()
    p.id = 'next'
    p.width = 50
    p.height = 50
    p.x = 670
    p.y = 450
    p.svg = new Path2D('M10 10 L40 25 L10 40')

    // Level button
    for (let i = 1; i <= game.levels.length; i++) {
        p = game.sprites.button.cloneCreate()
        p.id = 'lvl'
        p.width = 30
        p.height = 30
        p.x = 430 + i*40
        p.y = 515
        p.lvlNb = i
    }  

}

game.sprites.button.update = function () {
    // Restart level
    if (this.id == 'restart') {
        if (this.isClicked) {
            game.isPaused=false
            game.loadLevel(game.curLevel)
        }
        if (game.levelState != 'running' && !game.animationInProgress) {
            if (game.levelState=='failed') {
                this.x = 630
                this.y = 450
            } else {
                this.x = 590
                this.y = 450
            }
        } else {
            this.x = 200
            this.y = 600
        }
    }
    // Play/pause
    if (this.id == 'pause') {
        if (this.isClicked) {
            game.isPaused=!game.isPaused
            if(game.isPaused) {
                mge.sequencer.stop()
            } else {
                mge.sequencer.start()
            }
        }
        this.isVisible=true
        if (game.levelState!='running' && !game.animationInProgress) {this.isVisible=false}
    }
    // Audio
    if (this.id == 'audio') {
        if (this.isClicked) {
            game.audioOn=!game.audioOn
            if(!game.audioOn) {
                mge.audio.volume = 0
            } else {
                mge.audio.volume = 0.75
            }
        }
        this.isVisible=true
        if (game.levelState!='running' && !game.animationInProgress) {this.isVisible=false}
    }
    // Next level
    if (this.id == 'next') {
        // Visibility
        if (game.levelState=='won' &&  !game.animationInProgress) {this.isVisible=true} else {this.isVisible=false}
        // If is cliked
        if (this.isClicked && this.isVisible) {
            game.isPaused=false
            game.loadLevel(game.curLevel+1)
        }
    }
    // Level
    if (this.id == 'lvl' && this.isClicked && this.lvlNb -1 <= Number(localStorage.getItem(game.lclStorage))) {
        game.isPaused=false
        game.loadLevel(this.lvlNb-1)
    }
}

game.sprites.button.drawFunction = function (ctx) {
    if (this.id != 'lvl') {
        // Style
        ctx.fillStyle = game.hsl(game.mainColor,100,95)
        ctx.strokeStyle = game.hsl(game.mainColor,100,15)
        ctx.lineWidth = 4
        ctx.lineCap = "round"
        if (this.isClicked) {
            ctx.fillStyle = "white"
        }
        // Draw button box
        ctx.fillRect(0,0,50,50)
        ctx.strokeRect(0,0,50,50)
        // restart
        if (this.id == 'restart') {
            ctx.stroke(this.svg)
        } 
        // next
        if (this.id == 'next') {
            ctx.stroke(this.svg)
        } 
        // Pause
        if (this.id == 'pause') {
            if (game.isPaused) {ctx.stroke(this.svgPlay)} 
            else {ctx.stroke(this.svgPause)}
        } 
        // Audio
        if (this.id == 'audio') {
            if (game.audioOn) {ctx.stroke(this.svgOn)} 
            else {ctx.stroke(this.svgOff)}
        } 
    } else {
        if (game.levelState != 'running' && !game.animationInProgress) {
            // Levels
            if (this.lvlNb -1 <= Number(localStorage.getItem(game.lclStorage))) {ctx.fillStyle = game.hsl(game.mainColor,100,95)} else {ctx.fillStyle = game.hsl(game.mainColor,50,50)}
            ctx.strokeStyle = game.hsl(game.mainColor,100,15)
            ctx.lineWidth = 2
            ctx.fillRect (0,0,this.width,this.height)
            ctx.strokeRect (0,0,this.width,this.height)
            ctx.font = "bold 16px sans-serif"
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = game.hsl(game.mainColor,100,15)
            ctx.fillText(this.lvlNb,this.width/2,this.height/2)
        }
    }

}