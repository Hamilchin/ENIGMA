// *************************************************
// *************************************************
// Sprite general initialisation
// *************************************************
// *************************************************
game.sprites.hydro.reInit = function() {
    this.tanks = []
    this.distributors = []
    this.pipes = []
    this.combos = []
    this.valves = []
    this.showers = []
//    this.linkedTanks = []
}
game.sprites.hydro.create = function() {
    // Constants shared by all clones
    //this.drawBoundaries = true
    this.width = 100
    this.height = 100
    // Hydro constants
    this.flowConst = 0.5
    this.minPipeFlow = 50
    // List of objects by type
    this.reInit()
    // Colours
    this.waterCol = game.hsl(game.mainColor,100,75)
}

// *************************************************
// *************************************************
// CREATE
// *************************************************
// *************************************************
game.sprites.hydro.newTank = function (c) {
    // Create tank object
    let o = game.sprites.hydro.cloneCreate()
    o.type = 'T'
    // Hydro properties
    o.tankWidth = c.tankWidth
    o.tankHeight = c.tankHeight
    o.curHeight = c.curHeight
    o.isOpen = 1
    // World coordinates
    o.X = c.X
    o.altitude = c.altitude
    // Sprite properties
    o.width = c.tankWidth
    o.height = c.tankHeight
    o.x = c.X
    o.y = mge.game.height - c.altitude - c.tankHeight / 2
    o.isVisible = c.isVisible || '1'
    // Connection point
    o.connectionPointx = o.x
    o.connectionPointy = o.y + o.height / 2
    // Linked objects
    o.linkedObjects = []
    // Push to list
    game.sprites.hydro.tanks.push(o)
}

game.sprites.hydro.newDistributor = function (c) {
    // Create distributor object
    let o = game.sprites.hydro.cloneCreate()
    o.type = 'D'
    // Hydro properties
    o.pressure = 0
    // World coordinates
    o.X = c.X
    o.altitude = c.altitude
    // Sprite properties
    o.width = 20
    o.height = 20
    o.x = c.X
    o.y = mge.game.height - c.altitude - 10
    o.isVisible = c.isVisible || '1'
    // Connection point
    o.connectionPointx = o.x
    o.connectionPointy = o.y
    // Linked objects
    o.linkedObjects = []
    // Push to list
    game.sprites.hydro.distributors.push(o)
}

game.sprites.hydro.newValve = function (c) {
    // Create shower object
    let o = game.sprites.hydro.cloneCreate()
    o.type = 'V'
    // Hydro properties
    o.linkedTank = game.sprites.hydro.tanks[c.linkedTank]
    o.linkedTank.isOpen = c.isOpen
    o.trigger = c.trigger || 'click'
    // World coordinates
    //o.X = c.X
    //o.altitude = c.altitude
    o.X = o.linkedTank.X+15
    o.altitude = o.linkedTank.altitude-35
    // Sprite properties
    o.width = 50
    o.height = 50
    o.x = o.X
    o.y = mge.game.height - o.altitude - 10
    o.isVisible = c.isVisible || '1'
    // Push to list
    game.sprites.hydro.valves.push(o)
}

game.sprites.hydro.newPipe = function (c) {
    // Create pipe object
    let o = game.sprites.hydro.cloneCreate()
    o.type = 'P'
    let idObj1 = c.obj[0].slice(1)
    let idObj2 = c.obj[1].slice(1)
    // Connection 1
    if (c.obj[0][0] == 'T') {o.connection1 = game.sprites.hydro.tanks[idObj1]}
    if (c.obj[0][0] == 'D') {o.connection1 = game.sprites.hydro.distributors[idObj1]}
    // Connection 2
    if (c.obj[1][0] == 'T') {o.connection2 = game.sprites.hydro.tanks[idObj2]}
    if (c.obj[1][0] == 'D') {o.connection2 = game.sprites.hydro.distributors[idObj2]}
    // Update 'connected objects' list of each object
    o.connection1.linkedObjects.push(o.connection2)
    o.connection2.linkedObjects.push(o.connection1)
    // hydraulic properties
    o.flow = 0
    // Sprite properties
    o.width = Math.abs(o.connection1.connectionPointx-o.connection2.connectionPointx)
    o.height = Math.abs(o.connection1.connectionPointy-o.connection2.connectionPointy)
    o.x = (o.connection1.connectionPointx+o.connection2.connectionPointx) / 2
    o.y = (o.connection2.connectionPointy+o.connection1.connectionPointy) / 2
    // relative connexon points inside sprite
    o.connectionPoint1={}
    o.connectionPoint2={}
    // --> x
    if (o.connection1.connectionPointx < o.connection2.connectionPointx) {
        o.connectionPoint1.x = 0
        o.connectionPoint2.x = o.width
    }
    else {
        o.connectionPoint1.x = o.width
        o.connectionPoint2.x = 0
    }
    // --> y
    if (o.connection1.connectionPointy < o.connection2.connectionPointy) {
        o.connectionPoint1.y = 0
        o.connectionPoint2.y = o.height
    }
    else {
        o.connectionPoint1.y = o.height
        o.connectionPoint2.y = 0
    }
    o.isVisible = c.isVisible || '1'
    // Push to list
    game.sprites.hydro.pipes.push(o)
}

game.sprites.hydro.newCombo = function (c) {
    // Create combo of tanks object
    let o = game.sprites.hydro.cloneCreate()
    o.type = 'C'
    // Linked tanks
    let tanksNb = 0
    let tanksX = 0
    let tanksAltitude = 0
    let tanksWidth = 0
    let tanksHeight = 0
    o.linkedObjects = []
    c.forEach(function (tankIndex) {
        // Get tank object
        let tank = game.sprites.hydro.tanks[tankIndex]
        // Add to linked objects
        o.linkedObjects.push(tank)
        // For avg calculations
        tanksNb+=1
        tanksX+=tank.X
        tanksAltitude+=tank.altitude
        tanksWidth+=tank.width
        tanksHeight+=tank.height
        tank.isVisible = 0
    })
    // Hydro properties
    o.curHeight = 0
    o.tankWidth = tanksWidth
    o.tankHeight = tanksHeight / tanksNb
    // World coordinates
    o.X = tanksX / tanksNb
    o.altitude = tanksAltitude / tanksNb
    // Sprite properties
    o.width = o.tankWidth
    o.height = o.tankHeight
    o.x = o.X
    o.y = mge.game.height - o.altitude - o.tankHeight / 2
    o.isVisible = c.isVisible || '1'
    // Push to list
    game.sprites.hydro.combos.push(o)
}

game.sprites.hydro.newShower = function (c) {
    // Create shower object
    let o = game.sprites.hydro.cloneCreate()
    o.type = 'S'
    // Hydro properties
    o.linkedPipe = game.sprites.hydro.pipes[c.triggerPipe]
    o.isOpen = game.sprites.hydro.pipes[c.triggerPipe]
    // World coordinates
    o.X = c.X
    o.altitude = c.altitude
    // Sprite properties
    o.width = 50
    o.height = 50
    o.x = c.X
    o.y = mge.game.height - c.altitude - 10
    o.isVisible = c.isVisible || '1'
    // Push to list
    game.sprites.hydro.showers.push(o)
}

//game.sprites.hydro.newLinkedTanks = function (c) {
//    // Create combo of tanks object
//    let o = game.sprites.hydro.cloneCreate()
//    o.type = 'L'
//    // Linked tanks
//    o.sourceTank = game.sprites.hydro.tanks[c[0]]
//    o.targetTank = game.sprites.hydro.tanks[c[1]]
//    o.sourceHeighTrigger = game.sprites.hydro.tanks[c[1]].altitude - game.sprites.hydro.tanks[c[0]].altitude
//    o.sourceTank.isVisible = 0
//    o.targetTank.isVisible = 0
//    // Hydro properties
//    o.tankWidth = o.sourceTank.tankWidth
//    o.tankHeight = o.sourceTank.tankHeight + o.targetTank.tankHeight
//    o.curHeight =  o.sourceTank.curHeight + o.targetTank.curHeight
//    // World coordinates
//    o.X = o.sourceTank.X
//    o.altitude = o.sourceTank.altitude
//    // Sprite properties
//    o.width = o.tankWidth
//    o.height = o.tankHeight
//    o.x = o.X
//    o.y = mge.game.height - o.altitude - o.tankHeight / 2
//    o.isVisible = c.isVisible || '1'
//    // Push to list
//    game.sprites.hydro.linkedTanks.push(o)
//}

// *************************************************
// *************************************************
// UPDATE
// *************************************************
// *************************************************
game.sprites.hydro.update = function () {
    game.sprites.hydro.calcTanksPressure()
    game.sprites.hydro.updateValves()
    game.sprites.hydro.calcDistributorsPressure()
    game.sprites.hydro.calcPipesFlow()
    game.sprites.hydro.updateTankCurHeight()
//    game.sprites.hydro.transferLinkedTanks()
    game.sprites.hydro.updateComboCurHeight()
}

game.sprites.hydro.calcTanksPressure = function () {
    game.sprites.hydro.tanks.forEach(function (tank) {
        // Calculate hydro properties
        tank.volume = tank.tankWidth * tank.curHeight
        tank.pressure = tank.altitude + tank.curHeight
        // If tank is empty
        if (tank.curHeight == 0) {tank.pressure = Math.min(tank.linkedObjects[0].pressure,tank.pressure)}
    })
}

game.sprites.hydro.updateValves = function () {
    game.sprites.hydro.valves.forEach(function (valve) {
        // Clickable valve
        if (valve.trigger == 'click') {
            if (valve.isClicked) {
                if(valve.linkedTank.isOpen == 1) {valve.linkedTank.isOpen = 0}
                else {valve.linkedTank.isOpen = 1}
            }
        } else {
            // Valve triggered by tank height
            valve.linkedTank.isOpen = 0
            if (game.sprites.hydro.tanks[valve.trigger.tank].curHeight >= valve.trigger.height) {valve.linkedTank.isOpen = 1}
        }
    })
}

game.sprites.hydro.calcDistributorsPressure = function () {
    game.sprites.hydro.distributors.forEach(function (distributor) {
        // Init
        let inputPressure = 0
        let inputNb = 0
        distributor.pressure = 0
        // For each linked and opened objects
        distributor.linkedObjects.forEach(function (linkedObject) {
            if (linkedObject.isOpen == 1) {
                inputPressure += linkedObject.pressure
                inputNb+=1
            }
        })
        if (inputNb > 0) {distributor.pressure = inputPressure / inputNb}
    })
}

game.sprites.hydro.calcPipesFlow = function () {
    game.sprites.hydro.pipes.forEach(function (pipe) {
        // Calculate flow
        pipe.flow = pipe.connection1.pressure - pipe.connection2.pressure
        pipe.flow = Math.round(pipe.flow * game.sprites.hydro.flowConst)
        // If tank is closed, then flow = 0
        if (pipe.connection1.isOpen == 0) {pipe.flow = 0} 
        if (pipe.connection2.isOpen == 0) {pipe.flow = 0} 
        if (pipe.flow>0 && pipe.flow < game.sprites.hydro.minPipeFlow) {pipe.flow = game.sprites.hydro.minPipeFlow}
        if (pipe.flow<0 && pipe.flow > -game.sprites.hydro.minPipeFlow) {pipe.flow = -game.sprites.hydro.minPipeFlow}
    })
}

game.sprites.hydro.updateTankCurHeight = function () {
    // For each pipe, update the linked tank if exists
    game.sprites.hydro.pipes.forEach(function (pipe) {
        // Get linked tank and second linked object
        let linkedTank = {}
        if (pipe.connection1.type == 'T') {linkedTank = pipe.connection1}
        if (pipe.connection2.type == 'T') {linkedTank = pipe.connection2}
        // Calculate volume to move and height difference
        let volumeToMove = pipe.flow
        let heightDifference = volumeToMove / linkedTank.tankWidth
        // Update tank height
        linkedTank.curHeight -= heightDifference
        // Check curHeight is not negative
        if (linkedTank.curHeight < 0) {linkedTank.curHeight = 0}
    })
}

//game.sprites.hydro.transferLinkedTanks = function () {
//    // For each linked tanks
//    game.sprites.hydro.linkedTanks.forEach(function (link) {
//        // if minimal height reached in source tank, then transfer water
//        if (link.sourceTank.curHeight > link.sourceHeighTrigger) {
//            link.targetTank.curHeight+=link.sourceTank.curHeight-link.sourceHeighTrigger
//            link.sourceTank.curHeight = link.sourceHeighTrigger
//        } 
//        // Update cur height of the linkedtanks object
//        link.curHeight =  link.sourceTank.curHeight + link.targetTank.curHeight
//    })
//}

game.sprites.hydro.updateComboCurHeight = function () {
    // For each combo, update the linked tanks
    game.sprites.hydro.combos.forEach(function (combo) {
        // Calculate combo height
        let comboHeight = 0
        let tanksNb = 0
        combo.linkedObjects.forEach(function (tank) {
            tanksNb+=1
            if(tank.curHeight >= 1) {
                comboHeight += tank.curHeight
            }
        })
        // Calculate average height
        comboHeight = comboHeight / tanksNb
        combo.curHeight = comboHeight
        // Update linked tanks height
        combo.linkedObjects.forEach(function (tank) {
            tank.curHeight = comboHeight
        })
    })
}

// *************************************************
// *************************************************
// DRAW
// *************************************************
// *************************************************
game.sprites.hydro.drawFunction = function (ctx) {
    if (this.isVisible == 1 && this.drawMode == 'pipe') {
        if (this.type == 'P') {this.drawPipe(ctx)}
    }
    if (this.isVisible == 1 && this.drawMode == 'distributor') {
        if (this.type == 'D') {this.drawDistributor(ctx)}
        if (this.type == 'V') {this.drawValve(ctx)}
    }
    if (this.isVisible == 1 && this.drawMode == 'other') {
        if (this.type == 'T') {this.drawTank(ctx)}
        if (this.type == 'S') {this.drawShower(ctx)}
        if (this.type == 'C') {this.drawCombo(ctx)}
        if (this.type == 'L') {this.linkTanks(ctx)}
    }
}

game.sprites.hydro.drawTank = function (ctx) {
    // Draw tank
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, this.tankWidth, this.tankHeight)
    ctx.fillStyle = "darkgrey"
    ctx.fillRect(2, 2, this.tankWidth-4, this.tankHeight-4)
    ctx.fillStyle = "black"
    ctx.fillRect(4, 4, this.tankWidth-8, this.tankHeight-8)
    ctx.fillStyle = "dimgrey"
    ctx.fillRect(6, 6, this.tankWidth-12, this.tankHeight-12)
    // Draw water
    ctx.fillStyle = this.waterCol
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.fillRect(6, this.tankHeight-6, this.tankWidth-12, -this.curHeight)
    ctx.strokeRect(6, this.tankHeight-6, this.tankWidth-12, -this.curHeight)
    // Draw Link to structure
    ctx.fillStyle = game.hsl(game.mainColor,35,15)
    ctx.fillRect(this.width/2,0,4,130-this.y+this.height/2)
}

game.sprites.hydro.drawDistributor = function (ctx) {
    ctx.strokeStyle = "black"
    ctx.fillStyle = "darkgrey"
    ctx.lineWidth = 2
    ctx.fillRect(0, 0, 20, 20)
    ctx.strokeRect(0, 0, 20, 20)
}

game.sprites.hydro.drawValve = function (ctx) {
    ctx.fillStyle = "black"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    // Clickable valve
    if (this.trigger == 'click') {
        if (this.linkedTank.isOpen == 0) {
            ctx.fillRect(5, 0, 10, 50)
            ctx.fillRect(15, 15, 15, 20)
            ctx.fillStyle = "red"
            ctx.fillRect(30, 10, 10, 30)
            ctx.strokeRect(30, 10, 10, 30)
        } else {
            ctx.fillRect(15, 0, 10, 50)
            ctx.fillRect(20, 15, 20, 20)
            ctx.fillStyle = "green"
            ctx.fillRect(40, 10, 10, 30)
            ctx.strokeRect(40, 10, 10, 30)
        }
    } else {
    // Triggered valve
        if (this.linkedTank.isOpen == 0) {
            // Valve
            ctx.fillRect(-10, 15, 40, 20)
            ctx.fillRect(5, 0, 10, 50)
            // Link to tank (left)
            ctx.fillStyle = "red"
            ctx.fillRect(-10,23,-this.trigger.length,4)
            ctx.strokeRect(-10,23,-this.trigger.length,4)
        } else {
            // Valve
            ctx.fillRect(-10, 15, 10, 20)
            ctx.fillRect(20, 15, 10, 20)
            // Link to tank
            ctx.fillStyle = "green"
            ctx.fillRect(-10,23,-this.trigger.length,4)
            ctx.strokeRect(-10,23,-this.trigger.length,4)
        }
    }
}

game.sprites.hydro.drawPipe = function (ctx) {

    ctx.beginPath()
    ctx.moveTo(this.connectionPoint1.x,this.connectionPoint1.y)
    ctx.lineTo(this.connectionPoint1.x,this.connectionPoint2.y)
    ctx.lineTo(this.connectionPoint2.x,this.connectionPoint2.y)

    // Draw pipe border
    ctx.lineJoin = "round"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 22
    ctx.stroke()
    ctx.strokeStyle = "darkgrey"
    ctx.lineWidth = 18
    ctx.stroke()
    ctx.strokeStyle = "black"
    ctx.lineWidth = 14
    ctx.stroke()
    // Water
    ctx.strokeStyle = "dimgrey"
    //if (Math.abs(this.flow) > 0) {ctx.strokeStyle = this.waterCol}
    if (Math.abs(this.flow) > 0) {ctx.strokeStyle = this.waterCol}
    if (this.connection1.curHeight != 0 && this.connection1.isOpen == 1) {ctx.strokeStyle = this.waterCol}
    if (this.connection2.curHeight != 0 && this.connection2.isOpen == 1) {ctx.strokeStyle = this.waterCol}
    ctx.lineWidth = 10
    ctx.stroke()
}

game.sprites.hydro.drawShower = function (ctx) {
    // Draw shower
    ctx.strokeStyle = "black"
    ctx.fillStyle = "darkgrey"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(this.width/2,-2)
    ctx.lineTo(this.width+2,this.height+2)
    ctx.lineTo(-2,this.height+2)
    ctx.lineTo(this.width/2,-2)
    ctx.fill()
    ctx.stroke()
    // Draw water
    if(this.linkedPipe.flow < 0 && game.levelState=='running') {
        ctx.fillStyle = this.waterCol
        ctx.fillRect(-3,53,56,122)
    }
}

game.sprites.hydro.drawCombo = function (ctx) {
    // Draw as a tank
    this.drawTank(ctx)
}

//game.sprites.hydro.linkTanks = function (ctx) {
//    // Draw as a tank
//    this.drawTank(ctx)
//}
