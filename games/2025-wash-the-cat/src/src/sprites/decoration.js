game.sprites.decoration.create = function() {
    //this.drawBoundaries = true

    // End level
    p = game.sprites.decoration.cloneCreate()
    p.id = 'endLevel'
    p.width = 700
    p.height = 350
    p.x = 630
    p.y = 330
    p.txt = ''
    p.curDisplayScore = 0

    // Arrow
    p = game.sprites.decoration.cloneCreate()
    p.id = 'arrow'
    p.width = 100
    p.height = 100
    p.x = 750
    p.y = 395
    p.path = new Path2D("M0 50 L20 30 V40 L100 50 L20 60 V70 L0 50")
    p.vx = 1

    // Help
    p = game.sprites.decoration.cloneCreate()
    p.id = 'help'
    p.width = 100
    p.height = 100
    p.x = 740
    p.y = 480

    // Perfect hit
    p = game.sprites.decoration.cloneCreate()
    p.id = 'perfect'
    p.width = 0
    p.height = 0
    p.x = 650
    p.y = 300
    p.perfectTxt = 'GREAT!'

    // PAuse
    p = game.sprites.decoration.cloneCreate()
    p.id = 'pause'
    p.width = 0
    p.height = 0
    p.x = 650
    p.y = 150
}

game.sprites.decoration.update = function () {
    // End level
    if (this.id == 'endLevel') {
        if (game.levelState == 'running') {
            this.scaleY=0
            this.curDisplayScore=0
        }
        else {
            game.animationInProgress=true
            this.scaleY+=0.05
        }
        if (this.scaleY>=1) {
            this.scaleY=1
            // Clean level progression
            if (this.curDisplayScore<game.sprites.cat.cleanLevel*100) {
                this.curDisplayScore+=2
            } else {game.animationInProgress=false}
        }
        if (game.levelState=='failed') {this.txt='LEVEL ' + Number(game.curLevel+1) + ' FAILED'}
        else {this.txt='LEVEL ' + Number(game.curLevel+1) + ' COMPLETED'}
        if (this.curDisplayScore<game.sprites.cat.cleanLevel*100) {this.txt=''}
    }
    // Arrow
    if (this.id == 'arrow') {
        if (this.x < 740) {this.vx=0.4}
        if (this.x > 760) {this.vx=-0.4}
        this.x+=this.vx
    }
    // Perfect
    if (this.id == 'perfect' && game.sprites.cat.curAnimation == 'blocked') {
        this.scaleX = Math.min(1,this.scaleX+0.05)
        this.scaleY = Math.min(1,this.scaleY+0.05)
    }
    if (this.id == 'perfect' && game.sprites.cat.curAnimation != 'blocked') {
        this.scaleX=0
        this.scaleY=0
        let array = ['GREAT!','AMAZING!','FANTASTIC!','SUPERB!','EXCELLENT!','NICE!']
        this.perfectTxt=array[Math.floor(Math.random() * array.length)]
    }
}

game.sprites.decoration.drawFunction = function (ctx) {
    // End level
    if (this.id == 'endLevel' && game.levelState != 'running') {
        // Rectangle
        ctx.fillStyle = game.hsl(game.mainColor,100,98)
        ctx.strokeStyle = game.hsl(game.mainColor,100,15)
        ctx.lineWidth = 4
        ctx.fillRect(0,0,this.width,this.height+50)
        ctx.strokeRect(0,0,this.width,this.height+50)
        // Text
        ctx.font = "bold 50px sans-serif"
        ctx.fillStyle = game.hsl(game.mainColor,100,15)
        ctx.textAlign = 'center'
        ctx.fillText(this.txt,this.width/2,80)
        // Score bar
        ctx.fillRect(100,190,this.curDisplayScore*5,50)
        ctx.strokeRect(100,190,500,50)
        ctx.fillText(Math.round(this.curDisplayScore) + '%',this.width/2,150)
    }
    // Arrow
    if (this.id == 'arrow' && game.curLevel == 0 && game.levelState == 'running') {
        ctx.fillStyle = 'yellow'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.fill(this.path)
        ctx.stroke(this.path)
    }
    // Help
    if (this.id == 'help' && game.curLevel == 0 && game.levelState == 'running') {
        ctx.fillStyle = 'black'
        ctx.font = "bold 12px sans-serif"
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('OPEN / CLOSE THE TAP',80,0)
    }
    if (this.id == 'help' && game.curLevel == 3 && game.levelState == 'running') {
        ctx.fillStyle = 'black'
        ctx.font = "bold 12px sans-serif"
        ctx.fillText('REACH THIS POINT TO OPEN VALVE',40,50)
    }
    // Perfect hit
    if (this.id == 'perfect' && game.sprites.cat.curAnimation == 'blocked') {
        ctx.fillStyle = '#FF0000'
        ctx.strokeStyle = 'black'
        ctx.font = "bold 200px sans-serif"
        ctx.lineWidth = 4
        ctx.fillText(this.perfectTxt,0,0)
        ctx.strokeText(this.perfectTxt,0,0)
    }
    // Pause
    if (this.id == 'pause' && game.isPaused && game.levelState=='running') {
        ctx.fillStyle = 'yellow'
        ctx.strokeStyle = 'black'
        ctx.font = "bold 200px sans-serif"
        ctx.lineWidth = 4
        ctx.fillText('PAUSE',0,0)
        ctx.strokeText('PAUSE',0,0)
    }
}