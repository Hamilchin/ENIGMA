// Game description
game = {
  // Structure of the game
  scenes: {
    boot : {},
    main : {}
  },
  sprites:{
    button: mge.game.createSprite(),
    cat: mge.game.createSprite(),
    hydro: mge.game.createSprite(),
    decoration: mge.game.createSprite(),
    restartContinue: mge.game.createSprite()
  },
  // VAriables globales
  levels:[],
  curLevel:0,
  isPaused:false,
  mainColor:195, 
  animationInProgress:false,
  lclStorage:'wtc.maxLevelReached',
  audioOn:true,
 // Check level end
  getLevelState: function () {
    if (game.sprites.cat.cleanLevel >= 1) {game.levelState='won'}
    else if (game.sprites.cat.x >= game.sprites.cat.maxX && game.sprites.cat.cleanLevel >= 0.8) {game.levelState='won'}
    else if (game.sprites.cat.x >= game.sprites.cat.maxX && game.sprites.cat.cleanLevel < 0.8) {game.levelState='failed'}
    else {game.levelState='running'}
    if(game.levelState!='running') {game.isPaused=true}
    //if()
  },
  // utils
  hsl:function(h,s,l) {return 'hsl('+h+' '+s+'% '+l+'%)'},
  // other
  instruments:{},
  songs:{},
  background:{}
}

// Remove "Loading" div and start the game
window.addEventListener("load", (event) => {
  let loading = document.getElementById("loading")
  loading.remove()
  mge.game.width = 1280
  mge.game.height = 720
  mge.game.start(game.scenes.boot)
}
)