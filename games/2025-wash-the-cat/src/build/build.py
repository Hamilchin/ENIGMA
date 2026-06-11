import os
import buildUtils

inputFiles = ['../src/lib/mge_V1.1.1.js',\
              '../src/lib/mge_animationExtension_V0.0.1.js',\
              '../src/lib/mge_songExtension_V0.1.0.js',\
              '../src/game.js',\
              '../src/assets/instruments.js',\
              '../src/assets/songs.js',\
              '../src/assets/background.js',\
              '../src/assets/levels.js',\
              '../src/scenes/boot.js',\
              '../src/scenes/main.js',\
              '../src/sprites/cat.js',\
              '../src/sprites/hydro.js',\
              '../src/sprites/decoration.js',\
              '../src/sprites/restartContinue.js',\
              '../src/sprites/button.js'\
              ]


stringsToUglify=[]

#########################################
#########################################
# MGE
#########################################
#########################################


#########################################
# Audio
#########################################
# _applyADSR.js
stringsToUglify+=['_applyADSR','_envelop','_audioParam', '_startTime', '_duration', '_minValue', '_maxValue']
# _create.js
stringsToUglify+=['_audioContext','_audioGain']
# _playSound.js
stringsToUglify+=['_playSound','_synthConfig','_outputNode','_frequency','_startTime','_duration','_applyADSR','_context','_oscType']
stringsToUglify+=['_filterType','_volumeADSR','_pitchADSR','_detuneADSR','_filterFreqADSR','_filterQADSR','_oscGainADSR','_oscVolume','_filter','_osc']
stringsToUglify+=['_reverb','_delay','_feedbackGain']
# _setVolume.js
stringsToUglify+=['_setVolume']
# _volumeToGain.js
stringsToUglify+=['_volumeToGain','_maxDBReduction']
# Namespace
stringsToUglify+=['_audio','_volume']
#########################################
# Canvas
#########################################
# _create.js
stringsToUglify+=['_width','_height','_id', '_renderCanvas', '_renderContext']
# _fitToScreen.js
stringsToUglify+=['_fitToScreen','_HtmlCanvas','_scaleX', '_scaleY', '_scale']
# Namespace
stringsToUglify+=['_canvas']
#########################################
# Game
#########################################
# _create.js
stringsToUglify+=['_width','_height','_curScene', '_nextScene','_spritesList']
# _createSprite.js
stringsToUglify+=['_createSprite','_renderContext','_newSprite']
# _sceneChange.js
stringsToUglify+=['_sceneChange','_scene']
# _start.js
stringsToUglify+=['_start','_scene']
#_getClonesNb
stringsToUglify+=['_clonesNb','_getClonesNb']
# Namespace
stringsToUglify+=['_game']
#########################################
# Keyboard
#########################################
# _create.js
stringsToUglify+=['_keyPressedDetected','_keyPressed','_keyboard']
# _isKeyPressed.js
stringsToUglify+=['_isKeyPressed']
# _onKeyDown.js
stringsToUglify+=['_onKeyDown','_key']
# _onKeyUp.js
stringsToUglify+=['_onKeyUp','_key']
# _reset.js
stringsToUglify+=['_reset']
# _update.js
stringsToUglify+=['_update']
# Namespace
stringsToUglify+=['_keyboard']
#########################################
# Loop
#########################################
# _create.js
stringsToUglify+=['_lastTick','_currentTick','_elapsedTick','_fps','_status']
# _start.js
stringsToUglify+=['_start']
# _tick.js
stringsToUglify+=['_tick','_spritesList']
# Namespace
stringsToUglify+=['_loop']
#########################################
# Mouse
#########################################
# _create.js
stringsToUglify+=['_HtmlCanvas','_isClicked','_isDown','_isUp','_isPressed','_isReleased','_xDetected','_yDetected','_clickDetected','_downDetected','_upDetected']
# _onClick.js
stringsToUglify+=['_onClick']
# _onDown.js
stringsToUglify+=['_onDown']
# _onMove.js
stringsToUglify+=['_onMove']
# _onOut.js
stringsToUglify+=['_onOut']
# _onUp.js
stringsToUglify+=['_onUp']
# _reset.js
stringsToUglify+=['_reset']
# _reset.js
stringsToUglify+=['_update']
# Namespace
stringsToUglify+=['_mouse']
#########################################
# Sprite
#########################################
# _create.js
stringsToUglify+=['_ctx','_drawFunction','_width','_height','_scaleX','_scaleY','_isVisible','_drawBoundaries','_dragState','_selectState','_clonesList','_cloneIsValid']
# _draw.js
stringsToUglify+=['_draw']
# _isColliding.js
stringsToUglify+=['_isColliding','_spriteToCheck','_minXDistance','_minYDistance','_realXDistance','_realYDistance']
# _isClicked.js
stringsToUglify+=['_isClicked','_xTouched','_yTouched','_click']
# _isDragged.js
stringsToUglify+=['_isDragged']
# _isTouched.js
stringsToUglify+=['_isTouched','_xTouched','_yTouched','_xMaxSprite','_xMinSprite','_yMaxSprite','_yMinSprite']
# _isSelected.js
stringsToUglify+=['_isSelected']
# _cloneCleanList.js
stringsToUglify+=['_cloneCleanList','_cleanedList']
# _cloneCreate.js
stringsToUglify+=['_cloneCreate','_cloneIsValid','_clonesList']
# _cloneDeleteAll.js
stringsToUglify+=['_cloneDeleteAll','_clonesList']
# _cloneDelete.js
stringsToUglify+=['_cloneDelete','_cloneIsValid']
# _cloneExecuteForEach.js
stringsToUglify+=['_cloneExecuteForEach','_clonesList']
# _listCollisionsWithClones.js
stringsToUglify+=['_listCollisionsWithClones','_spriteToCheck','_touchedClones','_clonesList','_clone']
# Namespace
stringsToUglify+=['_sprite']
#########################################
# Sequencer
#########################################
# _create.js
stringsToUglify+=['_tracks','_bpm','_nextBarNum','_nextBarStartTime','_nextBarTriggerTime','_status']
# _createTrack.js
stringsToUglify+=['_createTrack','_bars','_instrument','_volume','_tracks','_track','_newTrack']
# _noteToFrequency.js
stringsToUglify+=['_noteToFrequency','_noteToEvaluate','_notesFrequence','_octave','_note','_frequency']
# _playTrackBar.js
stringsToUglify+=['_playTrackBar','_track','_barNum','_instrument','_volume','_bar','_curTime','_noteFrequency','_note','_duration']
# _play.js
stringsToUglify+=['_play','_currentAudioTime','_track']
# _start.js
stringsToUglify+=['_start']
# _stop.js
stringsToUglify+=['_stop']
# _track.js
stringsToUglify+=['_track','_bars','_instrument','_volume','_setVolume','_getBar','_numBar','_nbBars']
# Namespace
stringsToUglify+=['_sequencer']
#########################################
# Other
#########################################
stringsToUglify+=['_create']


#########################################
#########################################
# MGE API
#########################################
#########################################
# audio
stringsToUglify+=['currentAudioTime','volume','playSound','audio']
# sequencer
stringsToUglify+=['createTrack','sequencer']
# game
stringsToUglify+=['clonesNb','changeScene','createSprite']
# keyboard
stringsToUglify+=['keysPressed','isKeyPressed','keyboard']
# mouse
stringsToUglify+=['isClicked','mouse','isDown','isUp','isPressed','isReleased']
# _sprite
stringsToUglify+=['drawFunction','scaleX','scaleY','isVisible','drawBoundaries','isTouched','isClicked','isDragged','isSelected','cloneCreate','cloneDeleteAll','cloneDelete']
stringsToUglify+=['cloneExecuteForEach','listCollisionsWithClones']


#########################################
#########################################
# MGE IMAGE EXTENTION
#########################################
#########################################

#########################################
# Images
#########################################
stringsToUglify+=['_extensionImage','_createImage', '_newImage']
stringsToUglify+=['_create', '_config','_isLoaded','_scale', '_bitmap']
stringsToUglify+=['_draw']
stringsToUglify+=['_load','_offScreenCanvas','_gradient','_path','_isLoaded']
stringsToUglify+=['_setConfig']
stringsToUglify+=['_setScale']
stringsToUglify+=['_setScale']

#########################################
# Mge
#########################################
# mge.js
stringsToUglify+=['_images', '_imageObject']


#########################################
#########################################
# MGE SONG EXTENTION
#########################################
#########################################
stringsToUglify+=['_extensionSong','_songs','_list','_songObject']
stringsToUglify+=['_create','_config','_isLoaded','_tracks']
stringsToUglify+=['_load']
stringsToUglify+=['_play','_defaultInstrument','_curTrack','_tracks']
stringsToUglify+=['_setConfig']
stringsToUglify+=['_createSong','_newSong']
stringsToUglify+=['_loadNextSong','_nbSongsLoaded','_hasLoadedOneSong','_lstLength']


#########################################
#########################################
# MGE ANIMATION EXTENTION
#########################################
#########################################
stringsToUglify+=['_extensionAnimation','_animationObject']
stringsToUglify+=['_loadExtension']
stringsToUglify+=['_draw']
stringsToUglify+=['_setFrames','_frames']
stringsToUglify+=['_create','_currentFrame','_lastFrameTime','_timeBetweenFrames']
stringsToUglify+=['_restart']
stringsToUglify+=['animation']


#########################################
#########################################
# GAME
#########################################
#########################################
# game.js
stringsToUglify+=['game','scenes','boot','main','sprites','hydro','variables','instruments','songs','utils','mainColor','background','animationInProgress','lclStorage']
stringsToUglify+=['levelState','wtc.maxLevelReached']

# assets / instruments.js
stringsToUglify+=['preRenderedSounds','standardOsc','octave','volumeADSR','detuneADSR','filterType','filterADSR','reverb','oscGain','oscFilter','_delay','_feedbackGain']
stringsToUglify+=['getBufferId','preRender','playLive','playPreRendered','bass','arpege','lead']

# assets / songs
stringsToUglify+=['mainSong']

# assets / background (create)
stringsToUglify+=['htmlCanvas','canvasCtx','canvasHtmlRef','startX','startY']
# assets / background (draw buildings)
stringsToUglify+=['drawBuildings','maxWidth','maxHeight','buildingWidth','buildingHeight']
# assets / background (draw structure)
stringsToUglify+=['drawStructure']


# sprites / cat.js (init)
stringsToUglify+=['cleanLevel','speed','touchThresehold','blockedThresehold','touchCleanSpeed','blockedCleanSpeed','curAnimation','lastAnimation']
stringsToUglify+=['pathBody','pathLegs','pathTail','pathEyes']
stringsToUglify+=['walk1Body','walk1Legs','walk1Tail','walk1Image','walk2Body','walk2Legs','walk2Tail','walk2Image','walk3Body','walk3Legs','walk3Tail','walk3Image']
stringsToUglify+=['walkAnimation','faceBody','faceEyes','faceImage','faceAnimation','blockedAnimation']
stringsToUglify+=['blockedAnimation','blockedBody','blockedLegs','blockedTail','blockedImage']
# sprites / cat.js (update)
stringsToUglify+=['closestShowerAbsDistance','closestShowerDistance']
# sprites / cat.js (draw)
stringsToUglify+=['idle','walk','blocked']

# sprites / hydro.js (create)
stringsToUglify+=['newTank','tankWidth','tankHeight','curHeight','isOpen','altitude','connectionPointx','connectionPointy','linkedObjects']
stringsToUglify+=['newDistributor','pressure']
stringsToUglify+=['newValve','linkedTank','trigger']
stringsToUglify+=['newPipe','connection1','connection2','connectionPoint1','connectionPoint2']
stringsToUglify+=['newCombo','tanksNb','tanksX','tanksAltitude','tanksWidth','tanksHeight','tankIndex']
stringsToUglify+=['newShower','linkedPipe']
stringsToUglify+=['newLinkedTanks','sourceTank','targetTank','sourceHeighTrigger']
# sprites / hydro.js (update)
stringsToUglify+=['calcTanksPressure']
stringsToUglify+=['updateValves']
stringsToUglify+=['calcDistributorsPressure','inputPressure','inputNb','linkedObject']
stringsToUglify+=['calcPipesFlow','isFilled']
stringsToUglify+=['updateTankCurHeight','volumeToMove','heightDifference']
stringsToUglify+=['transferLinkedTanks']
stringsToUglify+=['updateComboCurHeight','comboHeight','tanksNb']
# sprites / hydro.js (draw)
stringsToUglify+=['drawTank','drawDistributor','drawValve','drawPipe']
# sprites / hydro.js (init)
stringsToUglify+=['flowConst','minPipeFlow','tanks','distributors','pipes','combos','valves','showers','linkedTanks']
# sprites / hydro.js (rammasse miettes)
stringsToUglify+=['tank','pipe','distributor','combo','valve','shower']

# sprites / decoration.js
stringsToUglify+=['endLevel','arrow','help','decoration']

# sprites / restartContinue.js
stringsToUglify+=['restartContinue']

# sprites / button.js
stringsToUglify+=['button','svgPlay','svgPause']


#########################################
#########################################
# RAMASSE MIETTE
#########################################
#########################################
stringsToUglify+=['pitchADSR','detuneADSR','filterFreqADSR','filterQADSR','noise','GAME_RENDER_CANVAS','_method','started','stopped','_nbBars','_point']
stringsToUglify+=['_activateOwnCloneAnimation','_detune']
stringsToUglify+=['loadLevel','isPaused','minValue','maxValue','newInstrument','feedbackLevel']


outputFile='main.js'

buildUtils.build(inputFiles,stringsToUglify,outputFile)