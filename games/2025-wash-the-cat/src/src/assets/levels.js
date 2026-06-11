// Laod a level
game.loadLevel = function(levelID) {
    // Generate background
    if (game.curLevel != levelID) {game.background.generate()}
    // Init cat
    game.sprites.cat.cleanLevel = 0
    // Init hydro
    game.sprites.hydro.reInit()
    game.sprites.hydro.cloneDeleteAll()
    // Check level id
    if (levelID >= game.levels.length) {levelID=0}
    // Update curLevel
    game.curLevel = levelID
    // Load level
    game.levels[game.curLevel]()
}

// Introduction
game.levels.push(function() {
        game.sprites.cat.x = 500
        game.sprites.cat.maxX = 740
        game.sprites.hydro.newTank({X:630,altitude:350,tankWidth:100,tankHeight:200,curHeight:180})
        game.sprites.hydro.newTank({X:630,altitude:-100,tankWidth:2000,tankHeight:200,curHeight:1,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:630,altitude:200})
        game.sprites.hydro.newPipe({obj:['T0','D0']})
        game.sprites.hydro.newPipe({obj:['T1','D0'],isVisible:'0'})
        game.sprites.hydro.newValve({linkedTank:0,isOpen:0})
        game.sprites.hydro.newShower({X:630,altitude:180,triggerPipe:1})
        }
)

// Consolidation with 2 tanks
//   T0         T1
//   D0         D1
//   T2T3     T4T5
//     D2     D3
//         T6
game.levels.push(function() {
        game.sprites.cat.x = 450
        game.sprites.cat.maxX = 820
        game.sprites.hydro.newTank({X:400,altitude:400,tankWidth:100,tankHeight:75,curHeight:25})
        game.sprites.hydro.newTank({X:850,altitude:400,tankWidth:100,tankHeight:75,curHeight:25})
        game.sprites.hydro.newTank({X:520,altitude:270,tankWidth:50,tankHeight:100,curHeight:0})
        game.sprites.hydro.newTank({X:570,altitude:270,tankWidth:50,tankHeight:100,curHeight:0})
        game.sprites.hydro.newTank({X:710,altitude:270,tankWidth:50,tankHeight:100,curHeight:0})
        game.sprites.hydro.newTank({X:760,altitude:270,tankWidth:50,tankHeight:100,curHeight:0})
        game.sprites.hydro.newTank({X:540,altitude:-100,tankWidth:2000,tankHeight:200,curHeight:1,isVisible:'0'})
        game.sprites.hydro.newCombo([2,3])
        game.sprites.hydro.newCombo([4,5])
        game.sprites.hydro.newDistributor({X:500,altitude:285,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:780,altitude:285,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:570,altitude:200})
        game.sprites.hydro.newDistributor({X:710,altitude:200})
        game.sprites.hydro.newPipe({obj:['T0','D0']})
        game.sprites.hydro.newPipe({obj:['T2','D0']})
        game.sprites.hydro.newPipe({obj:['T1','D1']})
        game.sprites.hydro.newPipe({obj:['T5','D1']})
        game.sprites.hydro.newPipe({obj:['T3','D2']})
        game.sprites.hydro.newPipe({obj:['T6','D2'],isVisible:'0'})
        game.sprites.hydro.newPipe({obj:['T4','D3']})
        game.sprites.hydro.newPipe({obj:['T6','D3'],isVisible:'0'})
        game.sprites.hydro.newValve({linkedTank:3,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:4,isOpen:0})
        game.sprites.hydro.newShower({X:570,altitude:180,triggerPipe:5})
        game.sprites.hydro.newShower({X:710,altitude:180,triggerPipe:7})
        }
)

// 1 tank, one vales opened
// T0                 T1
// D0                 D3
// T2T3
//   D1   T4T5T6        
//          D2        
//          T7        

game.levels.push(function() {
        game.sprites.cat.x = 580
        game.sprites.cat.maxX = 800
        game.sprites.hydro.newTank({X:400,altitude:450,tankWidth:100,tankHeight:100,curHeight:60})
        game.sprites.hydro.newTank({X:850,altitude:450,tankWidth:100,tankHeight:100,curHeight:60})
        game.sprites.hydro.newTank({X:500,altitude:300,tankWidth:50,tankHeight:120,curHeight:1})
        game.sprites.hydro.newTank({X:550,altitude:300,tankWidth:50,tankHeight:120,curHeight:1})
        game.sprites.hydro.newTank({X:650,altitude:250,tankWidth:50,tankHeight:170,curHeight:1})
        game.sprites.hydro.newTank({X:700,altitude:250,tankWidth:50,tankHeight:170,curHeight:1})
        game.sprites.hydro.newTank({X:750,altitude:250,tankWidth:50,tankHeight:170,curHeight:1})
        game.sprites.hydro.newTank({X:1000,altitude:-100,tankWidth:2000,tankHeight:200,curHeight:1,isVisible:'0'})
        game.sprites.hydro.newCombo([2,3])
        game.sprites.hydro.newCombo([4,5,6])
        game.sprites.hydro.newDistributor({X:420,altitude:250,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:570,altitude:200,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:700,altitude:200})
        game.sprites.hydro.newDistributor({X:770,altitude:200,isVisible:'0'})
        game.sprites.hydro.newPipe({obj:['T0','D0']})
        game.sprites.hydro.newPipe({obj:['T2','D0']})
        game.sprites.hydro.newPipe({obj:['T3','D1']})
        game.sprites.hydro.newPipe({obj:['T4','D1']})
        game.sprites.hydro.newPipe({obj:['T5','D2']})
        game.sprites.hydro.newPipe({obj:['T7','D2'],isVisible:'0'})
        game.sprites.hydro.newPipe({obj:['T1','D3']})
        game.sprites.hydro.newPipe({obj:['T6','D3']})
        game.sprites.hydro.newShower({X:700,altitude:180,triggerPipe:5})
        game.sprites.hydro.newValve({linkedTank:0,isOpen:1})
        game.sprites.hydro.newValve({linkedTank:1,isOpen:1})
        game.sprites.hydro.newValve({linkedTank:3,isOpen:1})
        }
)


// Add triggered valvle concept
//   T0         T1
//   D0         D1
//   T2T3     T4T5
//     D2     D3
//        T6T7  -->  T8
//                   D4
//                   T9
game.levels.push(function() {
        game.sprites.cat.x = 600
        game.sprites.cat.maxX = 995
        game.sprites.hydro.newTank({X:330,altitude:470,tankWidth:80,tankHeight:100,curHeight:47})
        game.sprites.hydro.newTank({X:780,altitude:470,tankWidth:80,tankHeight:100,curHeight:47})
        game.sprites.hydro.newTank({X:430,altitude:370,tankWidth:40,tankHeight:100,curHeight:0})
        game.sprites.hydro.newTank({X:470,altitude:370,tankWidth:40,tankHeight:100,curHeight:0})
        game.sprites.hydro.newTank({X:640,altitude:370,tankWidth:40,tankHeight:100,curHeight:0})
        game.sprites.hydro.newTank({X:680,altitude:370,tankWidth:40,tankHeight:100,curHeight:0})
        game.sprites.hydro.newTank({X:530,altitude:170,tankWidth:50,tankHeight:155,curHeight:0})
        game.sprites.hydro.newTank({X:580,altitude:170,tankWidth:50,tankHeight:155,curHeight:0})
        game.sprites.hydro.newTank({X:885,altitude:285,tankWidth:80,tankHeight:185,curHeight:100})
        game.sprites.hydro.newTank({X:885,altitude:-100,tankWidth:2000,tankHeight:200,curHeight:1,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:340,altitude:375,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:770,altitude:375,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:480,altitude:280,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:630,altitude:280,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:885,altitude:200})
        game.sprites.hydro.newPipe({obj:['T0','D0']})
        game.sprites.hydro.newPipe({obj:['T2','D0']})
        game.sprites.hydro.newPipe({obj:['T1','D1']})
        game.sprites.hydro.newPipe({obj:['T5','D1']})
        game.sprites.hydro.newPipe({obj:['T3','D2']})
        game.sprites.hydro.newPipe({obj:['T6','D2']})
        game.sprites.hydro.newPipe({obj:['T4','D3']})
        game.sprites.hydro.newPipe({obj:['T7','D3']})
        game.sprites.hydro.newPipe({obj:['T8','D4']})
        game.sprites.hydro.newPipe({obj:['T9','D4'],isVisible:'0'})
        game.sprites.hydro.newCombo([2,3])
        game.sprites.hydro.newCombo([4,5])
        game.sprites.hydro.newCombo([6,7])
        game.sprites.hydro.newValve({linkedTank:3,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:4,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:8,isOpen:0,trigger:{tank:7,height:80,direction:'L',length:300}})
        game.sprites.hydro.newShower({X:885,altitude:180,triggerPipe:9})
        }
)







// Two triggered tanks
game.levels.push(function() {
        game.sprites.cat.x = 400
        game.sprites.cat.maxX = 1000
        game.sprites.hydro.newTank({X:400,altitude:460,tankWidth:100,tankHeight:100,curHeight:85})
        game.sprites.hydro.newTank({X:650,altitude:460,tankWidth:100,tankHeight:100,curHeight:85})
        game.sprites.hydro.newTank({X:900,altitude:415,tankWidth:100,tankHeight:100,curHeight:85})
        game.sprites.hydro.newTank({X:500,altitude:350,tankWidth:50,tankHeight:100,curHeight:0})
        game.sprites.hydro.newTank({X:550,altitude:350,tankWidth:50,tankHeight:100,curHeight:0})
        game.sprites.hydro.newTank({X:750,altitude:250,tankWidth:50,tankHeight:200,curHeight:0})
        game.sprites.hydro.newTank({X:800,altitude:250,tankWidth:50,tankHeight:200,curHeight:0})
        game.sprites.hydro.newTank({X:1050,altitude:-100,tankWidth:2000,tankHeight:200,curHeight:1,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:420,altitude:355,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:670,altitude:255,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:570,altitude:200,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:900,altitude:200})
        game.sprites.hydro.newPipe({obj:['T0','D0']})
        game.sprites.hydro.newPipe({obj:['T3','D0']})
        game.sprites.hydro.newPipe({obj:['T1','D1']})
        game.sprites.hydro.newPipe({obj:['T5','D1']})
        game.sprites.hydro.newPipe({obj:['T4','D2']})
        game.sprites.hydro.newPipe({obj:['T6','D2']})
        game.sprites.hydro.newPipe({obj:['T2','D3']})
        game.sprites.hydro.newPipe({obj:['T7','D3'],isVisible:'0'})
        game.sprites.hydro.newCombo([3,4])
        game.sprites.hydro.newCombo([5,6])
        game.sprites.hydro.newValve({linkedTank:0,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:4,isOpen:1})
        game.sprites.hydro.newValve({linkedTank:1,isOpen:0,trigger:{tank:4,height:80,direction:'L',length:100}})
        game.sprites.hydro.newValve({linkedTank:2,isOpen:0,trigger:{tank:6,height:135,direction:'L',length:100}})
        game.sprites.hydro.newShower({X:900,altitude:180,triggerPipe:7})
        }
)


// Trigger that needs specific order to open
//                  T0T1
//      D0    D1
//    T2T3  
//            T4T5
//    D2        D3 
//                  T6T7   --> T8
//                             D4
//                             T9
game.levels.push(function() {
        game.sprites.cat.x = 600
        game.sprites.cat.maxX = 1100
        game.sprites.hydro.newTank({X:440,altitude:470,tankWidth:100,tankHeight:100,curHeight:85})
        game.sprites.hydro.newTank({X:540,altitude:470,tankWidth:100,tankHeight:100,curHeight:85})
        game.sprites.hydro.newTank({X:310,altitude:350,tankWidth:40,tankHeight:170,curHeight:0})
        game.sprites.hydro.newTank({X:350,altitude:350,tankWidth:40,tankHeight:170,curHeight:0})
        game.sprites.hydro.newTank({X:620,altitude:250,tankWidth:40,tankHeight:150,curHeight:0})
        game.sprites.hydro.newTank({X:660,altitude:250,tankWidth:40,tankHeight:150,curHeight:0})
        game.sprites.hydro.newTank({X:800,altitude:240,tankWidth:45,tankHeight:160,curHeight:0})
        game.sprites.hydro.newTank({X:845,altitude:240,tankWidth:45,tankHeight:160,curHeight:0})
        game.sprites.hydro.newTank({X:1000,altitude:397,tankWidth:150,tankHeight:120,curHeight:80})
        game.sprites.hydro.newTank({X:1000,altitude:-100,tankWidth:2000,tankHeight:200,curHeight:1,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:430,altitude:355,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:550,altitude:255,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:320,altitude:150,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:785,altitude:180,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:1000,altitude:200})
        game.sprites.hydro.newPipe({obj:['T0','D0']})
        game.sprites.hydro.newPipe({obj:['T3','D0']})
        game.sprites.hydro.newPipe({obj:['T1','D1']})
        game.sprites.hydro.newPipe({obj:['T4','D1']})
        game.sprites.hydro.newPipe({obj:['T2','D2']})
        game.sprites.hydro.newPipe({obj:['T7','D2']})
        game.sprites.hydro.newPipe({obj:['T5','D3']})
        game.sprites.hydro.newPipe({obj:['T6','D3']})
        game.sprites.hydro.newPipe({obj:['T8','D4']})
        game.sprites.hydro.newPipe({obj:['T9','D4'],isVisible:'0'})
        game.sprites.hydro.newCombo([0,1])
        game.sprites.hydro.newCombo([2,3])
        game.sprites.hydro.newCombo([4,5])
        game.sprites.hydro.newCombo([6,7])
        game.sprites.hydro.newValve({linkedTank:2,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:5,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:8,isOpen:0,trigger:{tank:7,height:125,direction:'L',length:130}})
        game.sprites.hydro.newShower({X:1000,altitude:180,triggerPipe:9})
        }
)

// Trigger that needs to be closed
// T0T1       D0           T2T3
//       T4
//            D1   T5T6  -->    
//                   D2     D3
//                          T7

game.levels.push(function() {
        game.sprites.cat.x = 500
        game.sprites.cat.maxX = 1050
        game.sprites.hydro.newTank({X:300,altitude:270,tankWidth:50,tankHeight:300,curHeight:0})
        game.sprites.hydro.newTank({X:350,altitude:270,tankWidth:50,tankHeight:300,curHeight:0})
        game.sprites.hydro.newTank({X:850,altitude:370,tankWidth:100,tankHeight:200,curHeight:180})
        game.sprites.hydro.newTank({X:950,altitude:370,tankWidth:100,tankHeight:200,curHeight:180})
        game.sprites.hydro.newTank({X:500,altitude:340,tankWidth:100,tankHeight:100,curHeight:80})
        game.sprites.hydro.newTank({X:650,altitude:290,tankWidth:50,tankHeight:150,curHeight:0})
        game.sprites.hydro.newTank({X:700,altitude:290,tankWidth:50,tankHeight:150,curHeight:0})
        game.sprites.hydro.newTank({X:950,altitude:-100,tankWidth:2000,tankHeight:200,curHeight:1,isVisible:'0'})
        game.sprites.hydro.newCombo([0,1])
        game.sprites.hydro.newCombo([2,3])
        game.sprites.hydro.newCombo([5,6])
        game.sprites.hydro.newDistributor({X:320,altitude:170,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:520,altitude:270,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:680,altitude:220,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:950,altitude:200})
        game.sprites.hydro.newPipe({obj:['T0','D0']})
        game.sprites.hydro.newPipe({obj:['T2','D0']})
        game.sprites.hydro.newPipe({obj:['T4','D1']})
        game.sprites.hydro.newPipe({obj:['T5','D1']})
        game.sprites.hydro.newPipe({obj:['T1','D2']})
        game.sprites.hydro.newPipe({obj:['T6','D2']})
        game.sprites.hydro.newPipe({obj:['T3','D3']})
        game.sprites.hydro.newPipe({obj:['T7','D3'],isVisible:'0'})
        game.sprites.hydro.newValve({linkedTank:0,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:6,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:3,isOpen:0,trigger:{tank:6,height:50,direction:'L',length:220}})
        game.sprites.hydro.newShower({X:950,altitude:180,triggerPipe:7})
        }
)


// Double trigger
// T0            T5              T10
// D0
//    T1
//    D1
//       T2T3T4
//           D2  D3
//                   T6T7
//                   D4D5
//                         T8T9  D6
//                               T11
game.levels.push(function() {
        game.sprites.cat.x = 300
        game.sprites.cat.maxX = 1000
        game.sprites.hydro.newTank({X:350,altitude:350,tankWidth:50,tankHeight:200,curHeight:80})
        game.sprites.hydro.newTank({X:430,altitude:450,tankWidth:50,tankHeight:100,curHeight:80})
        game.sprites.hydro.newTank({X:490,altitude:300,tankWidth:30,tankHeight:120,curHeight:0})
        game.sprites.hydro.newTank({X:520,altitude:300,tankWidth:30,tankHeight:120,curHeight:0})
        game.sprites.hydro.newTank({X:550,altitude:300,tankWidth:30,tankHeight:120,curHeight:0})
        game.sprites.hydro.newTank({X:610,altitude:420,tankWidth:60,tankHeight:130,curHeight:80})
        game.sprites.hydro.newTank({X:680,altitude:260,tankWidth:30,tankHeight:160,curHeight:0})
        game.sprites.hydro.newTank({X:710,altitude:260,tankWidth:30,tankHeight:160,curHeight:0})
        game.sprites.hydro.newTank({X:780,altitude:185,tankWidth:30,tankHeight:235,curHeight:0})
        game.sprites.hydro.newTank({X:810,altitude:185,tankWidth:30,tankHeight:235,curHeight:0})
        game.sprites.hydro.newTank({X:900,altitude:370,tankWidth:80,tankHeight:180,curHeight:80})
        game.sprites.hydro.newTank({X:900,altitude:-100,tankWidth:2000,tankHeight:200,curHeight:1,isVisible:'0'})
        game.sprites.hydro.newCombo([2,3,4])
        game.sprites.hydro.newCombo([6,7])
        game.sprites.hydro.newCombo([8,9])
        game.sprites.hydro.newDistributor({X:370,altitude:270,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:450,altitude:305,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:570,altitude:150,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:630,altitude:265,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:730,altitude:190,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:900,altitude:200})
        game.sprites.hydro.newPipe({obj:['T0','D0']})
        game.sprites.hydro.newPipe({obj:['T3','D0']})
        game.sprites.hydro.newPipe({obj:['T1','D1']})
        game.sprites.hydro.newPipe({obj:['T2','D1']})
        game.sprites.hydro.newPipe({obj:['T4','D2']})
        game.sprites.hydro.newPipe({obj:['T9','D2']})
        game.sprites.hydro.newPipe({obj:['T5','D3']})
        game.sprites.hydro.newPipe({obj:['T6','D3']})
        game.sprites.hydro.newPipe({obj:['T7','D4']})
        game.sprites.hydro.newPipe({obj:['T8','D4']})
        game.sprites.hydro.newPipe({obj:['T10','D5']})
        game.sprites.hydro.newPipe({obj:['T11','D5'],isVisible:'0'})
        game.sprites.hydro.newValve({linkedTank:0,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:1,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:4,isOpen:1})
        game.sprites.hydro.newValve({linkedTank:7,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:5,isOpen:0,trigger:{tank:4,height:85,direction:'L',length:50}})
        game.sprites.hydro.newValve({linkedTank:10,isOpen:0,trigger:{tank:9,height:150,direction:'L',length:80}})
        game.sprites.hydro.newShower({X:900,altitude:180,triggerPipe:11})
        }
)


// Triple trigger
game.levels.push(function() {
        game.sprites.cat.x = 300
        game.sprites.cat.maxX = 1100
        game.sprites.hydro.newTank({X:200,altitude:370,tankWidth:60,tankHeight:180,curHeight:60})
        game.sprites.hydro.newTank({X:280,altitude:370,tankWidth:50,tankHeight:180,curHeight:60})
        game.sprites.hydro.newTank({X:350,altitude:300,tankWidth:30,tankHeight:140,curHeight:0})
        game.sprites.hydro.newTank({X:380,altitude:300,tankWidth:30,tankHeight:140,curHeight:0})
        game.sprites.hydro.newTank({X:460,altitude:420,tankWidth:60,tankHeight:130,curHeight:15})
        game.sprites.hydro.newTank({X:550,altitude:380,tankWidth:50,tankHeight:170,curHeight:80})
        game.sprites.hydro.newTank({X:620,altitude:300,tankWidth:30,tankHeight:140,curHeight:0})
        game.sprites.hydro.newTank({X:650,altitude:300,tankWidth:30,tankHeight:140,curHeight:0})
        game.sprites.hydro.newTank({X:730,altitude:420,tankWidth:60,tankHeight:130,curHeight:15})
        game.sprites.hydro.newTank({X:820,altitude:380,tankWidth:50,tankHeight:170,curHeight:80})
        game.sprites.hydro.newTank({X:890,altitude:300,tankWidth:30,tankHeight:140,curHeight:0})
        game.sprites.hydro.newTank({X:920,altitude:300,tankWidth:30,tankHeight:140,curHeight:0})
        game.sprites.hydro.newTank({X:1000,altitude:450,tankWidth:80,tankHeight:100,curHeight:85})
        game.sprites.hydro.newTank({X:900,altitude:-100,tankWidth:2000,tankHeight:200,curHeight:1,isVisible:'0'})
        game.sprites.hydro.newCombo([2,3])
        game.sprites.hydro.newCombo([6,7])
        game.sprites.hydro.newCombo([10,11])
        game.sprites.hydro.newDistributor({X:220,altitude:250,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:300,altitude:302,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:480,altitude:250,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:570,altitude:302,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:750,altitude:250,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:840,altitude:302,isVisible:'0'})
        game.sprites.hydro.newDistributor({X:1000,altitude:200})
        game.sprites.hydro.newPipe({obj:['T0','D0']})
        game.sprites.hydro.newPipe({obj:['T3','D0']})
        game.sprites.hydro.newPipe({obj:['T1','D1']})
        game.sprites.hydro.newPipe({obj:['T2','D1']})
        game.sprites.hydro.newPipe({obj:['T4','D2']})
        game.sprites.hydro.newPipe({obj:['T7','D2']})
        game.sprites.hydro.newPipe({obj:['T5','D3']})
        game.sprites.hydro.newPipe({obj:['T6','D3']})
        game.sprites.hydro.newPipe({obj:['T8','D4']})
        game.sprites.hydro.newPipe({obj:['T11','D4']})
        game.sprites.hydro.newPipe({obj:['T9','D5']})
        game.sprites.hydro.newPipe({obj:['T10','D5']})
        game.sprites.hydro.newPipe({obj:['T12','D6']})
        game.sprites.hydro.newPipe({obj:['T13','D6'],isVisible:'0'})
        game.sprites.hydro.newValve({linkedTank:0,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:1,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:5,isOpen:0})
        game.sprites.hydro.newValve({linkedTank:9,isOpen:0})
        game.sprites.hydro.newShower({X:1000,altitude:180,triggerPipe:13})
        game.sprites.hydro.newValve({linkedTank:4,isOpen:0,trigger:{tank:3,height:90,direction:'L',length:50}})
        game.sprites.hydro.newValve({linkedTank:8,isOpen:0,trigger:{tank:7,height:85,direction:'L',length:50}})
        game.sprites.hydro.newValve({linkedTank:12,isOpen:0,trigger:{tank:11,height:85,direction:'L',length:50}})
        }
)
