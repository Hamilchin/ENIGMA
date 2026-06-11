class ChickpocalypseMeow {
    constructor(canvasId, gridSize = 8) {
        this.gameTitle = 'CHICKPOCALYPSE\nMEOW!';
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 8;
        this.uiRowHeight = 40;
        this.cellSize = 70; //Math.min(this.canvas.width, this.canvas.height - this.uiRowHeight) / this.gridSize;

        this.mainMenuTitleY = this.canvas.height / 2 - 100;
        this.mainMenuHighScoreY = this.canvas.height / 2 - 50; // Position below title, above buttons

        this.levelStartTitleY = -100;
        this.clickToStartY = this.canvas.height + 100;
        this.clickToStartLevelButton = new Button('Click to Start', this.canvas.width / 2, this.canvas.height + 100, 160, 40, {
            shadowColor: '#000'
        });

        this.levelCompleteTitleY = this.canvas.height + 50;
        this.levelCompleteScoreY = this.canvas.height + 80;
        this.levelCompleteTotalScoreY = this.canvas.height + 110;
        this.levelCompleteClickNextY = this.canvas.height + 140;
        this.levelCompleteClickForNextButton = new Button('Click for Next Level', this.canvas.width / 2, this.canvas.height + 100, 240, 40, {
            shadowColor: '#000'
        });

        this.playAgainButtonY = this.canvas.height + 110;

        this.draggedChick = null;
        this.dragOffset = {
            x: 0,
            y: 0
        };
        this.mousePos = {
            x: 0,
            y: 0
        };

        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

        this.gridOffsetX = (this.canvas.width - this.cellSize * this.gridSize) / 2;
        this.gridOffsetY = this.uiRowHeight + (this.canvas.height - this.uiRowHeight - this.cellSize * this.gridSize) / 2;

        this.startButton = new Button('PLAY!', this.canvas.width / 2, this.canvas.height / 2, 120, 50, {
            shadowColor: '#000'
        });
        this.howToPlayButton = new Button('How To Play', this.canvas.width / 2, (this.canvas.height) - 200, 240, 50, {
            shadowColor: '#000'
        });

        try {
            this.audioContext = new(window.AudioContext || window.webkitAudioContext)();
            // use to mute everything else, volume = 0 (.gain.value = 0)
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 1;
        } catch (e) {
            console.log(e);
            this.audioContext = null;
        }
        this.gameState = 'menu';
        this.level = 1;

        this.gameOver = {
            fadeAlpha: 0,
            flashTime: 0,
            titleX: this.canvas.width / 2,
            titleY: this.canvas.height + 50,
            titleTargetY: 180, //this.canvas.height / 2 - 80,
            finalScoreY: this.canvas.height + 80,
            finalScoreTargetY: 200, //this.canvas.height / 2 - 20,
            newHighScoreY: this.canvas.height + 110,
            newHighScoreTargetY: 220, //this.canvas.height / 2 + 20,
            highScoreY: this.canvas.height + 140,
            highScoreTargetY: 220, //this.canvas.height / 2 + 60,
            buttonY: this.canvas.height + 170,
            buttonTargetY: 500, //this.canvas.height / 2 + 120,
            isNewHighScore: false,
            selectedLine: null
        };

        this.gameOverTagLines = ['Meow!\nThat\'s What I Call Chickpocalypse Vol. 2025.', 'Black Cats 1 - Cute Little Chicks 0.\nNo Rematches!',
            'Furs 1 - Feathers 0\nGame Over Man!\nGame Over!',
            'It was a purr-fect massacre!',
            'They were purr-ged!',
            'They were absolutely meow-ssacred!',
            'An egg-stinction level event!',
            'They got seriously clucked up!',
            'Those cute little chicks...\neggs-terminated!',
            'Those cats are too fur-midable!',
            'Black cats rule! Chicks drool!',
            'Meow and forever!'
        ];

        this.playAgainButton = new Button('Play Again!', this.canvas.width / 2, this.gameOver.buttonY, 200, 80, {
            bgColor: '#0066ff',
            textColor: '#fff',
            shadowColor: '#3399ff'
        });

        this.tutorialStep = 0;
        this.tutorialSteps = [{
                type: 'chicks',
                text: '1/3\n Keep these cute little chicks alive!\nDrag and drop them in the green area\nwhile the timer is running.',
                spotlight: {
                    x: 75,
                    y: 80,
                    width: 450,
                    height: 450
                }
            },
            {
                type: 'timer',
                text: '2/3\n This is the countdown timer.\n\nYou have this time to figure out cat attack paths\n and drag your cute little chicks into safe areas\nto avoid the cats.\n\nThe time will get shorter as you get \nnearer to the inevitable Chickpocalypse!',
                spotlight: {
                    x: 0,
                    y: 0,
                    width: 600,
                    height: 40
                }
            },
            {
                type: 'paws',
                text: '3/3\n At the start of each level\nblack cats appear from the bushes.\n\nWhen time runs out they launch\nacross the screen killing all\n chicks in their path!\n\nEvery chick that survives a level\n is worth 10 points.',
                spotlight: [{
                        x: 0,
                        y: 40,
                        width: 75,
                        height: 485
                    }, // left
                    {
                        x: 525,
                        y: 40,
                        width: 75,
                        height: 485
                    }, // right  
                    {
                        x: 75,
                        y: 40,
                        width: 450,
                        height: 40
                    }, // top
                    {
                        x: 75,
                        y: 520,
                        width: 450,
                        height: 40
                    } // bottom
                ]
            }
        ];

        this.tutorialTextY = this.canvas.height + 100;
        this.tutorialButtonsY = this.canvas.height + 100;

        this.nextButton = new Button('Next', 450, this.canvas.height + 100, 80, 35, {
            shadowColor: '#c00'
        });
        this.prevButton = new Button('Prev', 350, this.canvas.height + 100, 80, 35, {
            shadowColor: '#c00'
        });
        this.playButton = new Button('Play!', 400, this.canvas.height + 100, 160, 70, {
            bgColor: '#ff8800',
            shadowColor: '#c00'
        });

        this.initMenuChicks();

        this.activeTweens = [];

        this.gameOver.isNewHighScore = false;
        this.highScoreFlashTime = 0;
        this.highScore = this.loadHighScore();
        this.totalScore = 0;
        this.levelScore = 0;
        this.timeLeft = 6;
        this.gameStartTime = Date.now();

        this.scoreAnimations = [];
        this.chicks = this.initializeChicks();
        this.paws = [];
        this.generatePaws();
        this.pawsMoving = false;

        this.isMuted = false;
        this.muteButton = new Button('🔊', this.canvas.width - 50, 20, 40, 30, {
            fontSize: 22,
            shadowColor: '#00bada'
        });

        this.pawSpeed = 8;

        this.canStartLevel = false;
        this.isRunning = true;
        this.startGameLoop();
        this.tweenMenuIn();
    }

    initMenuChicks() {
        this.menuChicks = [];
        for (let i = 0; i < 24; i++) {
            this.menuChicks.push({
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: Math.random() * (this.canvas.height - 100) + 50,
                scurryTimer: 0,
                scurryDuration: Math.random() * 60 + 30,
                scurryVelX: 0,
                scurryVelY: 0,
                pauseTimer: 0,
                eyeOffsetX: Math.random() * 4 - 2,
                eyeOffsetY: Math.random() * 4 - 2,
                eyeTimer: Math.random() * 100
            });
        }
    }

    updateMenuChicks() {
        if (this.gameState !== 'menu') return;
        this.menuChicks.forEach(chick => {
            if (chick.pauseTimer > 0) {
                chick.pauseTimer--;
            } else if (chick.scurryTimer <= 0) {
                const angle = Math.random() * Math.PI * 2;
                chick.scurryVelX = Math.cos(angle) * 1;
                chick.scurryVelY = Math.sin(angle) * 1;
                chick.scurryTimer = Math.random() * 40 + 20;
                chick.pauseTimer = 0;
            } else {
                const newX = chick.x + chick.scurryVelX;
                const newY = chick.y + chick.scurryVelY;
                if (newX >= 30 && newX <= this.canvas.width - 30) chick.x = newX;
                else chick.scurryVelX *= -1;
                if (newY >= 30 && newY <= this.canvas.height - 30) chick.y = newY;
                else chick.scurryVelY *= -1;
                chick.scurryTimer--;
                if (chick.scurryTimer <= 0) chick.pauseTimer = Math.random() * 30 + 10;
            }
            chick.eyeTimer += 0.05;
            chick.eyeOffsetX = Math.sin(chick.eyeTimer) * 2;
            chick.eyeOffsetY = Math.cos(chick.eyeTimer * 0.7) * 1.5;
        });
    }

    drawMenuChicks() {
        if (this.gameState !== 'menu') return;
        const radius = this.cellSize * 0.3;
        this.menuChicks.forEach(chick => {
            this.ctx.fillStyle = '#ffdd00';
            this.ctx.beginPath();
            this.ctx.roundRect(chick.x + 3 - radius, chick.y + 3 - radius, radius * 2, radius * 2, radius * 0.3);
            this.ctx.fill();
            this.drawChickEyes(chick.x, chick.y, 21, chick, false);
            this.drawChickBeak(chick.x, chick.y, 21, false);
        });
    }

    tweenMenuIn() {
        this.mainMenuTitleY = -100;
        this.startButton.y = this.canvas.height + 100;
        this.howToPlayButton.y = this.canvas.height + 100;
        this.mainMenuHighScoreY = this.canvas.height + 100;

        const titleTween = new Tween(this, 'mainMenuTitleY', -100, this.canvas.height / 2 - 160, 0.8, easeInOut);
        const scoreTween = new Tween(this, 'mainMenuHighScoreY', this.canvas.height + 100, this.canvas.height / 2 - 60, 0.8, easeInOut);
        const startTween = new Tween(this.startButton, 'y', this.canvas.height + 100, this.canvas.height / 2, 0.8, easeInOut);
        const howToTween = new Tween(this.howToPlayButton, 'y', this.canvas.height + 100, this.canvas.height - 200, 0.8, easeInOut);

        this.activeTweens.push(titleTween, startTween, howToTween, scoreTween);
    }

    tweenMenuOut(callback) {
        const titleTween = new Tween(this, 'mainMenuTitleY', this.mainMenuTitleY, -100, 0.5, easeInOut);
        const startTween = new Tween(this.startButton, 'y', this.startButton.y, this.canvas.height + 100, 0.5, easeInOut);
        const howToTween = new Tween(this.howToPlayButton, 'y', this.howToPlayButton.y, this.canvas.height + 100, 0.5, easeInOut);
        const scoreTween = new Tween(this, 'mainMenuHighScoreY', this.mainMenuHighScoreY, this.canvas.height + 100, 0.5, easeInOut, callback);

        this.activeTweens.push(titleTween, startTween, howToTween, scoreTween);
    }

    tweenLevelStartIn(callback) {
        // Force positions off-screen first
        this.levelStartTitleY = -100;
        this.clickToStartLevelButton.y = this.canvas.height + 100;

        // Start tweens on next frame
        setTimeout(() => {
            const levelTween = new Tween(this, 'levelStartTitleY', -100, this.canvas.height / 2 - 40, 0.8, easeInOut);
            const clickTween = new Tween(this.clickToStartLevelButton, 'y', this.canvas.height + 100, this.canvas.height / 2 + 20, 0.8, easeInOut, callback);
            this.activeTweens.push(levelTween, clickTween);
        }, 16);
    }

    tweenLevelStartOut(callback) {
        const levelTween = new Tween(this, 'levelStartTitleY', this.levelStartTitleY, -100, 0.5, easeInOut);
        const clickTween = new Tween(this.clickToStartLevelButton, 'y', this.clickToStartLevelButton.y, this.canvas.height + 100, 0.5, easeInOut, callback);
        this.activeTweens.push(levelTween, clickTween);
    }

    tweenTutorialIn() {
        this.setupTutorialButtons();
        this.tutorialTextY = this.canvas.height + 100;
        let targetTextY = 80;
        if (this.tutorialStep === 0) {
            targetTextY = 25;
        } else if (this.tutorialStep === this.tutorialSteps.length - 1) {
            targetTextY = this.canvas.height / 2 - 150;
        }
        const textTween = new Tween(this, 'tutorialTextY', this.canvas.height + 100, targetTextY, 0.8, easeInOut);
        this.activeTweens.push(textTween);

        if (this.tutorialStep === 0) {
            this.nextButton.y = this.canvas.height + 100;
            const buttonTween = new Tween(this.nextButton, 'y', this.canvas.height + 100, this.canvas.height - 100, 0.8, easeInOut);
            this.activeTweens.push(buttonTween);
        } else if (this.tutorialStep === this.tutorialSteps.length - 1) {
            this.prevButton.y = this.canvas.height + 100;
            this.playButton.y = this.canvas.height + 100;
            const prevTween = new Tween(this.prevButton, 'y', this.canvas.height + 100, this.canvas.height - 100, 0.8, easeInOut);
            const playTween = new Tween(this.playButton, 'y', this.canvas.height + 100, this.canvas.height - 100, 0.8, easeInOut);
            this.activeTweens.push(prevTween, playTween);
        } else {
            this.prevButton.y = this.canvas.height + 100;
            this.nextButton.y = this.canvas.height + 100;
            const prevTween = new Tween(this.prevButton, 'y', this.canvas.height + 100, this.canvas.height - 100, 0.8, easeInOut);
            const nextTween = new Tween(this.nextButton, 'y', this.canvas.height + 100, this.canvas.height - 100, 0.8, easeInOut);
            this.activeTweens.push(prevTween, nextTween);

        }
    }

    tweenTutorialOut(callback) {
        // catch the flash
        this.prevButton.y = this.canvas.height + 100;
        this.nextButton.y = this.canvas.height + 100;
        this.playButton.y = this.canvas.height + 100;

        // const textTween = new Tween(this, 'tutorialTextY', this.tutorialTextY, -100, 0.5, easeInOut);
        const textTween = new Tween(this, 'tutorialTextY', this.tutorialTextY, -250, 0.5, easeInOut);
        const buttonTween = new Tween(this, 'tutorialButtonsY', this.tutorialButtonsY, this.canvas.height + 100, 0.5, easeInOut, callback);
        this.activeTweens.push(textTween, buttonTween);
    }

    tweenLevelCompleteIn() {
        this.levelCompleteTitleY = this.canvas.height + 50;
        this.levelCompleteScoreY = this.canvas.height + 80;
        this.levelCompleteTotalScoreY = this.canvas.height + 110;
        this.levelCompleteClickForNextButton.y = this.canvas.height + 140;

        const completeTween = new Tween(this, 'levelCompleteTitleY', this.canvas.height + 50, this.canvas.height / 2 - 85, 0.8, easeInOut);
        const scoreTween = new Tween(this, 'levelCompleteScoreY', this.canvas.height + 80, this.canvas.height / 2 - 37, 0.8, easeInOut);
        const totalTween = new Tween(this, 'levelCompleteTotalScoreY', this.canvas.height + 110, this.canvas.height / 2 + 7, 0.8, easeInOut);
        const buttonTween = new Tween(this.levelCompleteClickForNextButton, 'y', this.canvas.height + 140, this.canvas.height / 2 + 60, 0.8, easeInOut);

        this.activeTweens.push(completeTween, scoreTween, totalTween, buttonTween);
    }

    tweenLevelCompleteOut(callback) {
        const completeTween = new Tween(this, 'levelCompleteTitleY', this.levelCompleteTitleY, -100, 0.5, easeInOut);
        const scoreTween = new Tween(this, 'levelCompleteScoreY', this.levelCompleteScoreY, -100, 0.5, easeInOut);
        const totalTween = new Tween(this, 'levelCompleteTotalScoreY', this.levelCompleteTotalScoreY, -100, 0.5, easeInOut);
        const buttonTween = new Tween(this.levelCompleteClickForNextButton, 'y', this.levelCompleteClickForNextButton.y, this.canvas.height + 100, 0.5, easeInOut, callback);

        this.activeTweens.push(completeTween, scoreTween, totalTween, buttonTween);
    }

    tweenGameOverIn() {
        const fadeTween = new Tween(this.gameOver, 'gameOverFadeAlpha', 0, 0.7, 0.8, easeInOut);
        const gameOverTween = new Tween(this.gameOver, 'titleY', this.canvas.height + 50, this.gameOver.titleTargetY, 0.8, easeInOut);
        const scoreTween = new Tween(this.gameOver, 'finalScoreY', this.canvas.height + 80, this.gameOver.finalScoreTargetY, 0.8, easeInOut);
        const buttonTween = new Tween(this.playAgainButton, 'y', this.gameOver.buttonY, this.gameOver.buttonTargetY, 0.8, easeInOut);

        this.activeTweens.push(fadeTween, gameOverTween, scoreTween, buttonTween);
    }

    tweenGameOverOut(callback) {
        const gameOverTween = new Tween(this.gameOver, 'titleY', this.gameOver.titleY, -250, 0.5, easeInOut);
        const scoreTween = new Tween(this.gameOver, 'finalScoreY', this.gameOver.finalScoreY, -100, 0.5, easeInOut);
        const buttonTween = new Tween(this.playAgainButton, 'y', this.playAgainButton.y, this.gameOver.buttonY, 0.8, easeInOut, callback);

        this.activeTweens.push(gameOverTween, scoreTween, buttonTween);
    }

    tweenPawsIn(callback) {
        this.paws.forEach((paw, index) => {
            const isLast = index === this.paws.length - 1;
            if (paw.direction === 'right' || paw.direction === 'left') {
                const tween = new Tween(paw, 'displayX', paw.displayX, paw.x, 1, easeInOut, isLast ? callback : null);
                this.activeTweens.push(tween);
            } else {
                const tween = new Tween(paw, 'displayY', paw.displayY, paw.y, 1, easeInOut, isLast ? callback : null);
                this.activeTweens.push(tween);
            }
        });
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('js13k-2025-black-cat-chickProtectorHighScore') || '0');
    }

    saveHighScore() {
        localStorage.setItem('js13k-2025-black-cat-chickProtectorHighScore', this.highScore.toString());
    }

    updateHighScore() {
        if (this.totalScore > this.highScore) {
            this.highScore = this.totalScore;
            this.saveHighScore();
            return true;
        }
        return false;
    }

    clearTweens() {
        this.activeTweens = [];
    }

    gameLoop() {
        const deltaTime = 1 / 60;
        this.activeTweens = this.activeTweens.filter(tween => {
            tween.update(deltaTime);
            return !tween.isComplete;
        });

        if (!this.isRunning) return;

        switch (this.gameState) {
            case 'menu':
                this.updateMenuChicks();
                break;
            case 'levelStart':
                break;
            case 'playing':
                this.updateTimer();
                this.chicks.forEach((chick, index) => {
                    if (!chick.dead && index !== this.draggedChick && !chick.playerMoved) {
                        if (chick.pauseTimer > 0) {
                            chick.pauseTimer--;
                        } else if (chick.scurryTimer <= 0) {
                            const angle = Math.random() * Math.PI * 2;
                            chick.scurryVelX = Math.cos(angle) * 0.9;
                            chick.scurryVelY = Math.sin(angle) * 0.9;
                            chick.scurryTimer = Math.random() * 40 + 20;
                            chick.pauseTimer = 0;
                        } else {
                            const radius = this.cellSize * 0.3;
                            const minX = this.gridOffsetX + this.cellSize + radius;
                            const maxX = this.gridOffsetX + (this.gridSize - 1) * this.cellSize - radius;
                            const minY = this.gridOffsetY + this.cellSize + radius;
                            const maxY = this.gridOffsetY + (this.gridSize - 1) * this.cellSize - radius;

                            const newX = chick.x + chick.scurryVelX;
                            const newY = chick.y + chick.scurryVelY;

                            if (newX >= minX && newX <= maxX) chick.x = newX;
                            else chick.scurryVelX *= -1;
                            if (newY >= minY && newY <= maxY) chick.y = newY;
                            else chick.scurryVelY *= -1;

                            chick.scurryTimer--;
                            if (chick.scurryTimer <= 0) chick.pauseTimer = Math.random() * 30 + 10;
                        }
                    }
                });
                if (this.timeLeft <= 0) {
                    this.gameState = 'pawsMoving';
                    this.startPawShooting();
                }
                break;

            case 'pawsMoving':
                this.updatePaws();
                if (this.paws.length === 0) {
                    this.checkLevelEnd();
                }
                break;
            case 'scoringAnimation':
                this.updateScoreAnimations();
                break;
            case 'levelComplete':
                break;
            case 'gameOver':
                this.gameOver.flashTime += 1 / 60;
                if (this.gameOver.fadeAlpha < 1) this.gameOver.fadeAlpha = Math.min(1, this.gameOver.fadeAlpha + 0.02);
                break;
        }

        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    checkLevelEnd() {
        const aliveChicks = this.chicks.filter(chick => !chick.dead);

        if (aliveChicks.length === 0) {
            this.gameState = 'gameOver';
            this.gameOver.selectedLine = null;
            this.gameOver.isNewHighScore = this.updateHighScore();
            this.tweenGameOverIn();
            this.playGameOverSound();
        } else {
            this.levelScore = aliveChicks.length * 10;
            this.totalScore += this.levelScore;

            this.createSequentialScoreAnimations(aliveChicks);

            this.gameState = 'scoringAnimation';
        }
    }

    createParallelScoreAnimations(aliveChicks) {
        // Create score animations
        this.scoreAnimations = aliveChicks.map((chick, index) => ({
            x: chick.x,
            y: chick.y,
            phase: 'rising',
            ticksRemaining: 20, // 20 ticks rising
            opacity: 1,
            index: index // for score pings
        }));
    }

    createSequentialScoreAnimations(aliveChicks) {
        const animationDuration = 12; // 50 Total ticks per animation (20 rising + 30 fading)

        const sortedChicks = aliveChicks.sort((a, b) => {
            if (Math.abs(a.y - b.y) < 20) { // Same row (within 20px)
                return a.x - b.x; // Sort left to right
            }
            return a.y - b.y; // Sort top to bottom
        });

        this.scoreAnimations = sortedChicks.map((chick, index) => ({
            x: chick.x,
            y: chick.y,
            phase: 'waiting',
            startDelay: index * animationDuration, // Each waits for previous to finish
            ticksRemaining: 0,
            opacity: 1,
            index: index // for score pings
        }));
    }

    startGameLoop() {
        this.gameLoop();
    }

    startLevel() {
        this.gameState = 'playing';
        const duration = this.getTimerDuration();
        this.timeLeft = duration;
        this.gameStartTime = Date.now();
        this.pawsMoving = false;
        this.startPawSlideIn();
    }

    nextLevel() {
        this.level++;
        this.resetLevel();
        this.gameState = 'levelStart';
        this.chicks.forEach(chick => {
            if (!chick.dead) chick.playerMoved = false;
        });
        this.tweenLevelStartIn(() => this.canStartLevel = true);
    }

    resetLevel() {
        this.chicks = this.chicks.filter(chick => !chick.dead);
        this.generatePaws();
        this.pawsMoving = false;
    }

    actuallyRestart() {
        this.level = 1;
        this.gameState = 'levelStart';
        this.gameOver.titleX = this.canvas.width / 2;
        this.chicks = this.initializeChicks();
        this.generatePaws();
        this.pawsMoving = false;
        this.gameOver.selectedLine = null;
    }

    updateTimer() {
        const duration = this.getTimerDuration();
        const elapsed = (Date.now() - this.gameStartTime) / 1000;
        this.timeLeft = Math.max(0, duration - elapsed);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.masterGain.gain.value = this.isMuted ? 0 : 1;
        this.muteButton.text = this.isMuted ? '🔈' : '🔊';
        this.muteButton.shadowColor = this.isMuted ? '#888' : '#00bada'
    }

    drawMuteButton() {
        this.ctx.fillStyle = this.isMuted ? '#666' : '#000';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('♪', this.canvas.width - 50, 30);

        if (this.isMuted) {
            this.ctx.strokeStyle = '#f00';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width - 65, 15);
            this.ctx.lineTo(this.canvas.width - 35, 35);
            this.ctx.stroke();
        }
    }

    playCountdownMusic() {
        if (this.isMuted || !this.audioContext) return;

        const sampleRate = 8000;
        const duration = this.getTimerDuration();
        const bufferSize = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(2, bufferSize, sampleRate);
        const leftData = buffer.getChannelData(0);
        const rightData = buffer.getChannelData(1);

        const SS = (s, o, r, p, t) => {
            const c = s.charCodeAt((t >> r) % p);
            return 32 == c ? 0 : 31 & t * 2 ** (c / 12 - o);
        };

        for (let i = 0; i < bufferSize; i++) {
            // const t = i;
            const timeScale = 6 / duration; // Speed up based on duration
            const t = i * timeScale;
            // leftData[i] = SS('024579', 6, 11, 6, t) * 0.3;
            // rightData[i] = SS('0 2 4 7', 5, 10, 8, t) * 0.3;
            leftData[i] = SS('024579', 6, 11, 6, t) * 0.1; // Reduced from 0.3
            rightData[i] = SS('0 2 4 7', 5, 10, 8, t) * 0.1; // Reduced from 0.3
        }

        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = buffer;
        this.audioSource.connect(this.masterGain);
        this.audioSource.start();
    }

    playCatAttackSound() {
        if (this.isMuted || !this.audioContext) return;
        const now = this.audioContext.currentTime;
        // louder with more cats?
        const volumeMultiplier = 1 + (this.paws.length - 1) * 0.33;

        const catGain = this.audioContext.createGain();
        catGain.gain.setValueAtTime(0.001, now);
        catGain.gain.exponentialRampToValueAtTime(1.0 * volumeMultiplier, now + 0.012); // fast attack
        catGain.gain.exponentialRampToValueAtTime(0.4 * volumeMultiplier, now + 0.075); // dip
        catGain.gain.exponentialRampToValueAtTime(0.8 * volumeMultiplier, now + 0.125); // second push
        catGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // fade out
        catGain.connect(this.masterGain);

        // "rumble"
        const baseFreq = 80;
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(baseFreq + i * 2, now);
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.3, now);
            osc.connect(gain).connect(catGain);
            osc.start(now);
            osc.stop(now + 0.3);
        }

        // "noisey"
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(1000, now);
        noiseFilter.Q.value = 1;

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        noise.connect(noiseFilter).connect(noiseGain).connect(catGain);
        noise.start(now);
        noise.stop(now + 0.3);

        // 
        [500, 1200, 2000].forEach(f => {
            const band = this.audioContext.createBiquadFilter();
            band.type = "bandpass";
            band.frequency.setValueAtTime(f, now);
            band.Q.value = 5;
            catGain.connect(band).connect(this.masterGain);
        });

        // "growl"
        const lfo = this.audioContext.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(25, now);
        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 0.3;
        lfo.connect(lfoGain).connect(catGain.gain);
        lfo.start(now);
        lfo.stop(now + 0.3);
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    onMouseDown(e) {
        const {
            x,
            y
        } = this.getMousePos(e);

        switch (this.gameState) {
            case 'menu':
                if (this.startButton.onMouseDown(x, y) || this.howToPlayButton.onMouseDown(x, y))
                    this.playButtonClickSound();
                break;
            case 'tutorial':
                if (this.nextButton.onMouseDown(x, y) || this.prevButton.onMouseDown(x, y) || this.playButton.onMouseDown(x, y))
                    this.playButtonClickSound();
                break;
            case 'levelStart':
                if (this.clickToStartLevelButton.onMouseDown(x, y)) this.playButtonClickSound();
                if (this.muteButton.onMouseDown(x, y)) this.playButtonClickSound();
                break;
            case 'playing':
                if (this.timeLeft > 0) {
                    this.chicks.forEach((chick, index) => {
                        const radius = this.cellSize * 0.3;
                        const distance = Math.sqrt((x - chick.x) ** 2 + (y - chick.y) ** 2);

                        if (!chick.dead && distance <= radius) {
                            this.playChickChirpSound();
                            this.draggedChick = index;
                            this.dragOffset.x = x - chick.x;
                            this.dragOffset.y = y - chick.y;
                            this.mousePos.x = x;
                            this.mousePos.y = y;
                        }
                    });
                }
                if (this.muteButton.onMouseDown(x, y)) {
                    this.playButtonClickSound();
                    this.toggleMute();
                }
                break;
            case 'scoringAnimation':
                if (this.muteButton.onMouseDown(x, y)) {
                    this.playButtonClickSound();
                    this.toggleMute();
                }
                break;
            case 'pawsMoving':
                if (this.muteButton.onMouseDown(x, y)) {
                    this.playButtonClickSound();
                    this.toggleMute();
                }
                break;
            case 'levelComplete':
                if (this.levelCompleteClickForNextButton.onMouseDown(x, y)) this.playButtonClickSound();
                if (this.muteButton.onMouseDown(x, y)) this.playButtonClickSound();
                break;
            case 'gameOver':
                if (this.playAgainButton.onMouseDown(x, y)) this.playButtonClickSound();
                break;
        }
    }

    onMouseMove(e) {
        const {
            x,
            y
        } = this.getMousePos(e);

        if (this.draggedChick !== null) {
            if (this.timeLeft <= 0) {
                this.chicks[this.draggedChick].isDragged = false;
                this.chicks[this.draggedChick].x = x;
                this.chicks[this.draggedChick].y = y;
                this.draggedChick = null;
                return;
            }
            const radius = this.cellSize * 0.3;
            const minX = this.gridOffsetX + this.cellSize + radius;
            const maxX = this.gridOffsetX + (this.gridSize - 1) * this.cellSize - radius;
            const minY = this.gridOffsetY + this.cellSize + radius;
            const maxY = this.gridOffsetY + (this.gridSize - 1) * this.cellSize - radius;
            this.mousePos.x = Math.max(minX, Math.min(maxX, x));
            this.mousePos.y = Math.max(minY, Math.min(maxY, y));
            return;
        }

        let overInteractive = false;
        switch (this.gameState) {
            case 'menu':
                overInteractive = this.startButton.onMouseMove(x, y) || this.howToPlayButton.onMouseMove(x, y);
                break;
            case 'tutorial':
                overInteractive = this.nextButton.onMouseMove(x, y) || this.prevButton.onMouseMove(x, y) || this.playButton.onMouseMove(x, y);
                break;
            case 'levelStart':
                overInteractive = this.clickToStartLevelButton.onMouseMove(x, y) || this.muteButton.onMouseMove(x, y);
                break;
            case 'playing':
                overInteractive = this.chicks.some(chick => !chick.dead && Math.sqrt((x - chick.x) ** 2 + (y - chick.y) ** 2) <= this.cellSize * 0.3) || this.muteButton.onMouseMove(x, y);
                break;
            case 'scoringAnimation':
                overInteractive = this.muteButton.onMouseMove(x, y);
                break;
            case 'pawsMoving':
                overInteractive = this.muteButton.onMouseMove(x, y);
                break;
            case 'levelComplete':
                overInteractive = this.levelCompleteClickForNextButton.onMouseMove(x, y) || this.muteButton.onMouseMove(x, y);;
                break;
            case 'gameOver':
                overInteractive = this.playAgainButton.onMouseMove(x, y);
                break;
        }

        this.canvas.style.cursor = overInteractive ? 'pointer' : 'default';
    }

    onMouseUp(e) {

        if (this.draggedChick !== null) {
            this.chicks[this.draggedChick].x = this.mousePos.x - this.dragOffset.x;
            this.chicks[this.draggedChick].y = this.mousePos.y - this.dragOffset.y;
            this.chicks[this.draggedChick].playerMoved = true;
            this.draggedChick = null;
            return;
        }

        const {
            x,
            y
        } = this.getMousePos(e);

        switch (this.gameState) {
            case 'menu':
                if (this.startButton.onMouseUp(x, y)) {
                    this.tweenMenuOut(() => {
                        this.gameState = 'levelStart';
                        setTimeout(() => this.tweenLevelStartIn((() => this.canStartLevel = true)), 16);
                    });
                } else if (this.howToPlayButton.onMouseUp(x, y)) {
                    this.gameState = 'tutorial';
                    this.tutorialStep = 0;
                    this.tweenTutorialIn();
                }
                break;
            case 'tutorial':
                if (this.tutorialStep === 0) {
                    if (this.nextButton.onMouseUp(x, y)) {
                        this.tweenTutorialOut(() => {
                            this.tutorialStep++;
                            setTimeout(() => this.tweenTutorialIn(), 16);
                        });
                    }
                } else if (this.tutorialStep === this.tutorialSteps.length - 1) {
                    if (this.playButton.onMouseUp(x, y)) {
                        this.tweenMenuOut(() => {
                            this.gameState = 'levelStart';
                            setTimeout(() => this.tweenLevelStartIn((() => this.canStartLevel = true)), 16);
                        });
                    }
                    if (this.prevButton.onMouseUp(x, y)) {
                        this.tweenTutorialOut(() => {
                            this.tutorialStep--;
                            setTimeout(() => this.tweenTutorialIn(), 16);
                        });
                    }
                } else {
                    if (this.nextButton.onMouseUp(x, y)) {
                        this.tweenTutorialOut(() => {
                            this.tutorialStep++;
                            setTimeout(() => this.tweenTutorialIn(), 16);
                        });

                    }
                    if (this.prevButton.onMouseUp(x, y)) {
                        this.tweenTutorialOut(() => {
                            this.tutorialStep--;
                            setTimeout(() => this.tweenTutorialIn(), 16);
                        });
                    }
                }
                break;

            case 'levelStart':
                if (this.muteButton.onMouseUp(x, y)) {
                    this.toggleMute();
                }
                if (this.clickToStartLevelButton.onMouseUp(x, y)) {
                    if (this.canStartLevel) {
                        this.tweenLevelStartOut();

                        setTimeout(() => this.tweenPawsIn(
                            () => {
                                this.startLevel();
                                this.playCountdownMusic();
                            }
                        ), 16);
                    }
                }
                break;
            case 'levelComplete':
                if (this.muteButton.onMouseUp(x, y)) {
                    this.toggleMute();
                }
                if (this.levelCompleteClickForNextButton.onMouseUp(x, y)) {
                    this.tweenLevelCompleteOut(() => this.nextLevel());
                }
                break;
            case 'gameOver':
                if (this.playAgainButton.onMouseUp(x, y)) {
                    this.tweenGameOverOut(() => {
                        this.actuallyRestart();
                        this.gameState = 'levelStart';
                        setTimeout(() => this.tweenLevelStartIn(), 16);
                    });
                }
                break;
        }
    }

    initializeChicks() {
        const chicks = [];
        const playableWidth = (this.gridSize - 2) * this.cellSize;
        const playableHeight = (this.gridSize - 2) * this.cellSize;
        const cols = 6,
            rows = 4;
        const spacingX = playableWidth / cols,
            spacingY = playableHeight / rows;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const baseX = this.gridOffsetX + this.cellSize + col * spacingX + spacingX / 2;
                const baseY = this.gridOffsetY + this.cellSize + row * spacingY + spacingY / 2;
                const offsetRange = Math.min(spacingX, spacingY) * 0.3;
                const x = baseX + (Math.random() - 0.5) * offsetRange;
                const y = baseY + (Math.random() - 0.5) * offsetRange;

                chicks.push({
                    x,
                    y,
                    scurryTimer: 0,
                    scurryDuration: Math.random() * 60 + 30,
                    scurryVelX: 0,
                    scurryVelY: 0,
                    pauseTimer: 0,
                    eyeOffsetX: Math.random() * 4 - 2,
                    eyeOffsetY: Math.random() * 4 - 2,
                    eyeTimer: Math.random() * 100,
                    beakOpen: false
                });
            }
        }
        return chicks;
    }

    startPawShooting() {
        this.pawsMoving = true;
        this.paws.forEach(paw => {
            paw.currentX = paw.x;
            paw.currentY = paw.y;
        });
        this.playCatAttackSound(this.audioContext);
    }

    playChickDeathSound() {
        if (this.isMuted || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.25;

        // Main aggressive screech
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'square'; // Add harshness

        // Much higher, more aggressive frequencies
        osc1.frequency.setValueAtTime(1800, now);
        osc1.frequency.exponentialRampToValueAtTime(2400, now + 0.05);
        osc1.frequency.exponentialRampToValueAtTime(900, now + duration);

        osc2.frequency.setValueAtTime(1200, now);
        osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(600, now + duration);

        // Much louder and more aggressive envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1.2, now + 0.01); // Very sharp attack, louder
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    }

    updateScoreAnimations() {
        this.scoreAnimations = this.scoreAnimations.filter(anim => {
            anim.ticksRemaining--;
            // sequential animation check
            if (anim.phase === 'waiting') {
                if (anim.startDelay > 0) {
                    anim.startDelay--;
                } else {
                    anim.phase = 'rising';
                    anim.ticksRemaining = 12;
                    this.playScoreSound(anim.index);
                }
            } else if (anim.phase === 'rising') {
                anim.y -= 2; // Move up slowly
                if (anim.ticksRemaining <= 0) {
                    anim.phase = 'fading';
                    anim.ticksRemaining = 30; // 30 ticks to fade
                    anim.opacity = 1;
                }
            } else if (anim.phase === 'fading') {
                anim.opacity = anim.ticksRemaining / 30;
                if (anim.ticksRemaining <= 0) return false; // Remove
            }
            return true; // Keep
        });

        // Show level complete when all animations done
        if (this.gameState === 'scoringAnimation' && this.scoreAnimations.length === 0) {
            this.gameState = 'levelComplete';
            this.tweenLevelCompleteIn();
        }
    }

    playGameOverSound() {
        if (!this.audioContext || this.isMuted) return;
        const notes = [523.25, 493.88, 466.16, 440.00, 415.30, 392.00]; // C5, B4, A#4, A4, G#4, G4
        const now = this.audioContext.currentTime;
        const noteDuration = 0.3;

        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const duration = i === notes.length - 1 ? 0.8 : noteDuration; // Last note longer
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * noteDuration);
            gain.gain.setValueAtTime(0.15, now + i * noteDuration);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * noteDuration + duration);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + i * noteDuration);
            osc.stop(now + i * noteDuration + duration);
        });
    }

    playScoreSound(index) {
        if (this.isMuted) return;
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.15;

        // Start at C5 (523Hz) and go up in major scale intervals
        const baseFreq = 523; // C5
        const scaleMultipliers = [1, 1.125, 1.25, 1.33, 1.5, 1.67, 1.875, 2]; // Major scale
        const freq = baseFreq * scaleMultipliers[index % 8];

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
    }

    playChickChirpSound() {
        if (this.isMuted || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.1;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.3);
        osc.frequency.exponentialRampToValueAtTime(600, now + duration);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);
    }

    playButtonClickSound() {
        if (!this.audioContext || this.isMuted) return;
        const now = this.audioContext.currentTime;
        const duration = 0.1;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(293.66, now); // D4 note
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);
    }

    generatePaws() {
        const positions = [];
        for (let i = 1; i < this.gridSize - 1; i++) {
            positions.push({
                x: 0,
                y: i,
                direction: 'right'
            }, {
                x: this.gridSize - 1,
                y: i,
                direction: 'left'
            });
            positions.push({
                x: i,
                y: 0,
                direction: 'down'
            }, {
                x: i,
                y: this.gridSize - 1,
                direction: 'up'
            });
        }

        this.paws = [];
        for (let i = 0; i < Math.min(this.level, 12) && positions.length > 0; i++) {
            const idx = Math.floor(Math.random() * positions.length);
            const paw = positions.splice(idx, 1)[0];

            const oppositeIdx = positions.findIndex(p =>
                (paw.x === 0 && p.x === this.gridSize - 1 && p.y === paw.y) ||
                (paw.x === this.gridSize - 1 && p.x === 0 && p.y === paw.y) ||
                (paw.y === 0 && p.y === this.gridSize - 1 && p.x === paw.x) ||
                (paw.y === this.gridSize - 1 && p.y === 0 && p.x === paw.x)
            );
            if (oppositeIdx !== -1) positions.splice(oppositeIdx, 1);

            // Set off-screen positions
            switch (paw.direction) {
                case 'right':
                    paw.displayX = -2;
                    break;
                case 'left':
                    paw.displayX = this.gridSize + 1;
                    break;
                case 'down':
                    paw.displayY = -2;
                    break;
                case 'up':
                    paw.displayY = this.gridSize + 1;
                    break;
            }
            paw.displayX = paw.displayX !== undefined ? paw.displayX : paw.x;
            paw.displayY = paw.displayY !== undefined ? paw.displayY : paw.y;

            this.paws.push(paw);
        }
    }


    startPawSlideIn() {
        this.paws.forEach(paw => {
            if (paw.direction === 'right' || paw.direction === 'left') {
                paw.displayX = paw.x;
            } else {
                paw.displayY = paw.y;
            }
        });
    }

    updatePaws() {
        const deltaTime = 1 / 60;
        const moveAmount = this.pawSpeed * deltaTime;

        for (let i = this.paws.length - 1; i >= 0; i--) {
            const paw = this.paws[i];

            switch (paw.direction) {
                case 'right':
                    paw.currentX += moveAmount;
                    break;
                case 'left':
                    paw.currentX -= moveAmount;
                    break;
                case 'down':
                    paw.currentY += moveAmount;
                    break;
                case 'up':
                    paw.currentY -= moveAmount;
                    break;
            }

            this.chicks.forEach((chick, chickIndex) => {
                if (chick.dead) return;

                // Paw rectangle bounds
                const pawSize = this.cellSize * 0.75;
                const pawLeft = this.gridOffsetX + paw.currentX * this.cellSize + (this.cellSize - pawSize) / 2;
                const pawTop = this.gridOffsetY + paw.currentY * this.cellSize + (this.cellSize - pawSize) / 2;
                const pawRight = pawLeft + pawSize;
                const pawBottom = pawTop + pawSize;

                // Find closest point on rectangle to circle center
                const closestX = Math.max(pawLeft, Math.min(chick.x, pawRight));
                const closestY = Math.max(pawTop, Math.min(chick.y, pawBottom));

                // Check distance from closest point to circle center
                const distance = Math.sqrt((closestX - chick.x) ** 2 + (closestY - chick.y) ** 2);
                const chickRadius = this.cellSize * 0.3;

                if (distance <= chickRadius) {
                    chick.dead = true;
                    this.playChickDeathSound();
                    if (this.draggedChick === chickIndex) this.draggedChick = null;
                }
            })

            if (paw.currentX < 0 || paw.currentX >= this.gridSize ||
                paw.currentY < 0 || paw.currentY >= this.gridSize) {
                this.paws.splice(i, 1);
            }
        }
    }

    drawTextWithDepth(text, x, y, font = 'Arial', fontSize, textColor = '#000', shadowColor = 'rgba(0,0,0,0.5)', shadowOffset = 3) {
        this.ctx.font = fontSize + 'px ' + font;
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = shadowColor;
        this.ctx.fillText(text, x + shadowOffset, y + shadowOffset);
        this.ctx.fillStyle = textColor;
        this.ctx.fillText(text, x, y);
    }

    drawText(text, x, y, fontSize, color = '#000', shadowOffset = 2) {
        this.ctx.fillStyle = color;
        this.ctx.font = fontSize + 'px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillText(text, x + shadowOffset, y + shadowOffset);
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    drawTextWithBackground(text, x, y, fontSize, textColor = '#000', bgColor = 'rgba(255,255,255,0.8)', padding = 10) {
        this.ctx.font = fontSize + 'px Arial';
        this.ctx.textAlign = 'center';
        const textWidth = this.ctx.measureText(text).width;
        const textHeight = fontSize;
        this.ctx.fillStyle = bgColor;
        this.ctx.beginPath();
        this.ctx.roundRect(x - textWidth / 2 - padding, y - textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding * 2, 8);
        this.ctx.fill();
        this.ctx.fillStyle = textColor;
        this.ctx.fillText(text, x, y + fontSize / 3);
    }

    drawTutorialSpotlight() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        if (this.tutorialStep === 0) {
            this.ctx.fillRect(0, 0, this.canvas.width, this.gridOffsetY + this.cellSize);
            this.ctx.fillRect(0, this.gridOffsetY + (this.gridSize - 1) * this.cellSize, this.canvas.width, this.canvas.height - (this.gridOffsetY + (this.gridSize - 1) * this.cellSize));
            this.ctx.fillRect(0, this.gridOffsetY + this.cellSize, this.gridOffsetX + this.cellSize, (this.gridSize - 2) * this.cellSize);
            this.ctx.fillRect(this.gridOffsetX + (this.gridSize - 1) * this.cellSize, this.gridOffsetY + this.cellSize, this.canvas.width - (this.gridOffsetX + (this.gridSize - 1) * this.cellSize), (this.gridSize - 2) * this.cellSize);
        } else if (this.tutorialStep === 1) {
            this.ctx.fillRect(0, this.uiRowHeight, this.canvas.width, this.canvas.height - this.uiRowHeight);
        } else if (this.tutorialStep === 2) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(this.gridOffsetX + this.cellSize, this.gridOffsetY + this.cellSize, (this.gridSize - 2) * this.cellSize, (this.gridSize - 2) * this.cellSize);
        }
    }

    drawTutorialText(lines) {
        const textY = this.tutorialTextY;
        lines.forEach((line, index) => this.drawTextWithDepth(line, 300, textY + (index * 30), 'Arial', 24, '#fff', '#ccc', 1));
    }


    drawTutorialButtons() {
        if (this.tutorialStep === 0) this.nextButton.draw(this.ctx);
        else if (this.tutorialStep === this.tutorialSteps.length - 1) {
            this.prevButton.draw(this.ctx);
            this.playButton.draw(this.ctx);
        } else {
            this.prevButton.draw(this.ctx);
            this.nextButton.draw(this.ctx);
        }
    }

    drawTutorialOverlay() {
        const currentStep = this.tutorialSteps[this.tutorialStep];
        const lines = currentStep.text.split('\n');
        this.drawTutorialSpotlight();
        this.drawTutorialText(lines);
        this.drawTutorialButtons();
    }

    setupTutorialButtons() {
        if (this.tutorialStep === 0) {
            this.nextButton.x = this.canvas.width - 100;
        } else if (this.tutorialStep === this.tutorialSteps.length - 1) {
            this.prevButton.x = 100;
            this.playButton.x = this.canvas.width / 2;
        } else {
            this.prevButton.x = 100;
            this.nextButton.x = this.canvas.width - 100;
        }
    }

    drawGameOverText() {
        this.ctx.fillStyle = '#f00';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        const baseTextY = this.tutorialStep === 0 ? this.canvas.height / 2 - 50 : 80;
        let textY = this.tutorialTextY !== undefined ? this.tutorialTextY : baseTextY;
        let textX = this.canvas.width / 2;
        if (this.tutorialStep === 0) {
            textY = 25;
        }
        if (this.tutorialStep === this.tutorialSteps.length - 1) {
            textX = 300;
            textY = this.canvas.height / 2 - 50;
        }
        lines.forEach((line, index) => this.drawTextWithDepth(line, textX, textY + (index * 30), 24, 'white', 'grey', 1));
    }

    drawGameOver(cx, cy) {
        this.drawTextWithDepth('GAME OVER', cx, this.gameOver.titleY - 60, 'Impact', 72, '#cc0000', '#fff', 2);

        this.drawTextWithDepth(`SCORE: ${this.totalScore.toString().padStart(5, '0')}`, cx, this.gameOver.titleY + 10, 'Impact', 32, '#cc0000', '#fff', 1);

        if (this.gameOver.isNewHighScore) {
            this.highScoreFlashTime += 1 / 60;
            const flashSpeed = 2;
            const isFlashOn = Math.floor(this.highScoreFlashTime * flashSpeed) % 2;
            const flashColor = isFlashOn ? '#ffff00' : '#ff8800'; // Yellow/orange flash
            this.drawTextWithDepth('NEW HIGH SCORE!', cx, this.gameOver.titleY + 45, 'Impact', 28, flashColor, 1);
        }

        this.drawTextWithDepth('The Chickpocalypse is inevitable!', this.canvas.width / 2, this.gameOver.titleY + 120, 'Arial', 24, '#fff', '#ccc', 1);

        if (!this.gameOver.selectedLine) this.gameOver.selectedLine = this.gameOverTagLines[Math.floor(Math.random() * this.gameOverTagLines.length)];
        const splitLines = this.gameOver.selectedLine.split('\n');
        splitLines.forEach((line, index) => this.drawTextWithDepth(line, this.canvas.width / 2, this.gameOver.titleY + 164 + (index * 30), 'Arial', 24, '#fff', '#ccc', 1));

        this.playAgainButton.draw(this.ctx);
    }

    drawUI() {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        switch (this.gameState) {
            case 'menu':
                this.ctx.fillStyle = 'yellow';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawMenuChicks();
                this.gameTitle.split('\n').forEach((line, index) => this.drawTextWithDepth(line, cx, this.mainMenuTitleY + (index * 60), 'Arial', 60, '#000', '#ccc', 1));
                this.drawText(`HIGH SCORE: ${this.highScore.toString().padStart(5, '0')}`, cx, this.mainMenuHighScoreY, 24, '#000');
                this.startButton.draw(this.ctx);
                this.howToPlayButton.draw(this.ctx);
                break;
            case 'tutorial':
                this.drawTutorialOverlay();
                break;
            case 'levelStart':
                this.drawTextWithBackground(`Level ${this.level}`, cx, this.levelStartTitleY, 32);
                this.clickToStartLevelButton.draw(this.ctx);
                this.muteButton.draw(this.ctx);
                break;
            case 'playing':
                this.muteButton.draw(this.ctx);
                break;
            case 'scoringAnimation':
                this.muteButton.draw(this.ctx);
                break;
            case 'pawsMoving':
                this.muteButton.draw(this.ctx);
                break;
            case 'levelComplete':
                this.drawTextWithBackground(`Level ${this.level} Complete!`, cx, this.levelCompleteTitleY, 32, '#000');
                this.drawTextWithBackground(`Level Score: ${this.levelScore}`, cx, this.levelCompleteScoreY, 24);
                this.drawTextWithBackground(`Total Score: ${this.totalScore}`, cx, this.levelCompleteTotalScoreY, 24);
                this.levelCompleteClickForNextButton.draw(this.ctx);
                this.muteButton.draw(this.ctx);
                break;
            case 'gameOver':
                // fade to black
                this.ctx.fillStyle = `rgba(0, 0, 0, ${this.gameOver.fadeAlpha})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawGameOver(cx, cy);
                break;
        }
    }

    drawWorld() {
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(this.gridOffsetX + this.cellSize, this.gridOffsetY + this.cellSize, (this.gridSize - 2) * this.cellSize, (this.gridSize - 2) * this.cellSize);

        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.lineWidth = 6;
        this.ctx.roundRect(this.gridOffsetX + this.cellSize, this.gridOffsetY + this.cellSize, (this.gridSize - 2) * this.cellSize, (this.gridSize - 2) * this.cellSize, this.cellSize * 0.1);
        this.ctx.fill();

        this.ctx.fillStyle = '#654321';
        for (let x = 0; x < this.gridSize; x++) {
            this.ctx.fillRect(this.gridOffsetX + x * this.cellSize, this.gridOffsetY, this.cellSize, this.cellSize);
            this.ctx.fillRect(this.gridOffsetX + x * this.cellSize, this.gridOffsetY + (this.gridSize - 1) * this.cellSize, this.cellSize, this.cellSize);
        }
        for (let y = 1; y < this.gridSize - 1; y++) {
            this.ctx.fillRect(this.gridOffsetX, this.gridOffsetY + y * this.cellSize, this.cellSize, this.cellSize);
            this.ctx.fillRect(this.gridOffsetX + (this.gridSize - 1) * this.cellSize, this.gridOffsetY + y * this.cellSize, this.cellSize, this.cellSize);
        }
    }

    drawTreeBorders() {
        const colors = ['#228B22', '#32CD32', '#006400'];
        const treeRadius = this.cellSize * 0.8;

        for (let side = 0; side < 4; side++) {
            let currentPos = 0;
            while (currentPos < (side % 2 === 0 ? this.gridSize * this.cellSize : this.gridSize * this.cellSize)) {
                const overlap = 0.3 + (currentPos * 7 % 50) / 100 * 0.4;
                let centerX, centerY;

                if (side === 0) {
                    centerX = this.gridOffsetX + currentPos - treeRadius * 0.5;
                    centerY = this.gridOffsetY - treeRadius * 0.6;
                } else if (side === 1) {
                    centerX = this.gridOffsetX + this.gridSize * this.cellSize + treeRadius * 0.6;
                    centerY = this.gridOffsetY + currentPos - treeRadius * 0.5;
                } else if (side === 2) {
                    centerX = this.gridOffsetX + this.gridSize * this.cellSize - currentPos + treeRadius * 0.5;
                    centerY = this.gridOffsetY + this.gridSize * this.cellSize + treeRadius * 0.6;
                } else {
                    centerX = this.gridOffsetX - treeRadius * 0.6;
                    centerY = this.gridOffsetY + this.gridSize * this.cellSize - currentPos + treeRadius * 0.5;
                }

                this.ctx.fillStyle = colors[(Math.floor(currentPos / 20) + side) % colors.length];
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, treeRadius, 0, Math.PI * 2);
                this.ctx.fill();

                currentPos += treeRadius * (2 - overlap);
            }
        }
    }

    drawTreeCluster(centerX, centerY) {
        const colors = ['#228B22', '#32CD32', '#006400'];
        for (let i = 0; i < 4; i++) {
            const offsetX = (Math.random() - 0.5) * this.cellSize * 0.6;
            const offsetY = (Math.random() - 0.5) * this.cellSize * 0.6;
            const radius = this.cellSize * 0.2 + Math.random() * this.cellSize * 0.15;
            this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            this.ctx.beginPath();
            this.ctx.arc(centerX + offsetX, centerY + offsetY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    getTimerDuration() {
        if (this.level <= 4) return 6;
        if (this.level <= 8) return 5;
        return 4;
    }

    drawTimer() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.uiRowHeight);

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.uiRowHeight);
        this.ctx.stroke();

        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        const seconds = Math.ceil(this.timeLeft);
        const timeText = seconds.toString().padStart(2, '0');
        this.drawTextWithDepth(timeText, this.canvas.width / 2, this.uiRowHeight / 2 + 8, 'Impact', 32, 'black', 'grey', 2);
    }

    drawCatHead(centerX, centerY, size, paw) {
        const halfSize = size / 2;
        const topWidth = size;
        const bottomWidth = size * 0.7;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - topWidth / 2 + 3, centerY - halfSize + 3);
        this.ctx.lineTo(centerX + topWidth / 2 + 3, centerY - halfSize + 3);
        this.ctx.lineTo(centerX + bottomWidth / 2 + 3, centerY + halfSize + 3);
        this.ctx.lineTo(centerX - bottomWidth / 2 + 3, centerY + halfSize + 3);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = paw.color || '#000';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - topWidth / 2, centerY - halfSize);
        this.ctx.lineTo(centerX + topWidth / 2, centerY - halfSize);
        this.ctx.lineTo(centerX + bottomWidth / 2, centerY + halfSize);
        this.ctx.lineTo(centerX - bottomWidth / 2, centerY + halfSize);
        this.ctx.closePath();
        this.ctx.fill();
    }


    drawSquareCatHead(x, y, direction, isAttacking, paw) {
        this.setupCatTransform(x, y, direction);
        this.drawCatShadow();
        this.drawCatBody(paw);
        this.drawCatEyes(paw, isAttacking);
        this.drawCatMouth(isAttacking);
        this.ctx.restore();
    }

    setupCatTransform(x, y, direction) {
        this.ctx.save();
        this.ctx.translate(x + 35, y + 35);
        if (direction === 'right') this.ctx.rotate(-Math.PI / 2);
        else if (direction === 'left') this.ctx.rotate(Math.PI / 2);
        else if (direction === 'up') this.ctx.rotate(Math.PI);
    }

    drawCatShadow() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(-18, -18, 42, 42);
        this.ctx.beginPath();
        this.ctx.moveTo(-18, -18);
        this.ctx.lineTo(-7, -18);
        this.ctx.lineTo(-12, -26);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(7, -18);
        this.ctx.lineTo(21, -18);
        this.ctx.lineTo(15, -26);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawCatBody(paw) {
        this.ctx.fillStyle = paw.color || '#000';
        this.ctx.fillRect(-21, -21, 42, 42);
        this.ctx.beginPath();
        this.ctx.moveTo(-21, -21);
        this.ctx.lineTo(-8, -21);
        this.ctx.lineTo(-15, -29);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(8, -21);
        this.ctx.lineTo(21, -21);
        this.ctx.lineTo(15, -29);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawCatEyes(paw, isAttacking) {
        const timeLeft = this.timeLeft || 0;
        let isReady = timeLeft > 0 && timeLeft <= 2;
        const eyeSize = 10;
        const depthSize = 12;
        const darkerColor = paw.color === '#222';
        this.ctx.fillStyle = '#fff600';
        this.ctx.fillRect(-6, -11, eyeSize, eyeSize * 1.5);
        this.ctx.fillRect(6, -11, eyeSize, eyeSize * 1.5);

        if (isAttacking) {
            isReady = true;
        }

        if (isReady) {
            this.ctx.fillStyle = '#000';
            // Left eye triangle
            this.ctx.beginPath();
            this.ctx.moveTo(-6, -11); // Top-left 
            this.ctx.lineTo(4, -11); // Top-right
            this.ctx.lineTo(4, 4); // Bottom-right
            this.ctx.fill();
            this.ctx.closePath();

            // Right eye triangle
            this.ctx.beginPath();
            this.ctx.moveTo(16, -11); // Top-right
            this.ctx.lineTo(6, -11); // Top-lef
            this.ctx.lineTo(6, 4); // Bottom-left
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    drawCatMouth(isAttacking) {
        const timeLeft = this.timeLeft || 0;
        const isReady = timeLeft > 0 && timeLeft <= 2;
        let fangAlpha = isReady ? Math.min(1, (2 - timeLeft) / 2) : 0;
        let chompOffset = 0;

        if (!isAttacking) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(-3, 10, 7, 10);
        } else {
            fangAlpha = 2;
            chompOffset = Math.sin(Date.now() * 0.02) * 2;
        }

        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(4, 12 + chompOffset);
        this.ctx.lineTo(-5, 12 + chompOffset);
        this.ctx.lineTo(0, 20 + chompOffset);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(19, 12 + chompOffset);
        this.ctx.lineTo(10, 12 + chompOffset);
        this.ctx.lineTo(14, 20 + chompOffset);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillRect(0, 12 + chompOffset, 14, 4);

        if (isAttacking) {
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(2, 18 - chompOffset, 10, 2);
        }


        this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - fangAlpha})`;
        this.ctx.fillRect(-5, 10, 25, 12);
    }

    drawPaws() {
        this.paws.forEach(paw => {
            const posX = this.pawsMoving ? paw.currentX : paw.displayX;
            const posY = this.pawsMoving ? paw.currentY : paw.displayY;
            this.drawSquareCatHead(this.gridOffsetX + posX * this.cellSize,
                this.gridOffsetY + posY * this.cellSize,
                paw.direction,
                this.pawsMoving,
                paw
            );
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawWorld();
        this.drawChicks();
        this.drawPaws();
        this.drawTreeBorders();

        if (this.gameState === 'scoringAnimation') {
            this.ctx.fillStyle = '#000';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';

            this.scoreAnimations.forEach(anim => {
                this.ctx.globalAlpha = anim.opacity;
                this.drawTextWithDepth('+10', anim.x, anim.y, 'Impact', 24, '#000', '#fff', 1);
            });

            this.ctx.globalAlpha = 1;
        }

        this.drawTimer();
        this.drawUI();
    }

    drawChicks() {
        const radius = this.cellSize * 0.3;
        this.chicks.forEach((chick, index) => {
            const isDragged = index === this.draggedChick;
            const centerX = isDragged ? this.mousePos.x - this.dragOffset.x : chick.x;
            const centerY = isDragged ? this.mousePos.y - this.dragOffset.y : chick.y;

            if (isDragged) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.roundRect(centerX + 3 - radius, centerY + 3 - radius, radius * 2, radius * 2, radius * 0.3);
                this.ctx.fill();
            }

            this.ctx.fillStyle = chick.dead ? 'rgba(157, 160, 12, 1)' : isDragged ? '#ffee44' : '#ffdd00';
            this.ctx.beginPath();
            this.ctx.roundRect(centerX - radius, centerY - radius, radius * 2, radius * 2, radius * 0.3);
            this.ctx.fill();

            if (chick.dead) {
                this.drawDeadChickFeatures(centerX, centerY, radius);
            } else {
                if (!isDragged) {
                    chick.eyeTimer += 0.05;
                    chick.eyeOffsetX = Math.sin(chick.eyeTimer) * 2;
                    chick.eyeOffsetY = Math.cos(chick.eyeTimer * 0.7) * 1.5;
                }
                this.drawChickEyes(centerX, centerY, radius, chick, isDragged);
                this.drawChickBeak(centerX, centerY, radius, isDragged);
            }
        });
    }

    drawDeadChickFeatures(centerX, centerY, radius) {
        const xSize = radius * 0.2,
            eyeDistance = radius * 0.4;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        [-1, 1].forEach(side => {
            const eyeX = centerX + side * eyeDistance,
                eyeY = centerY - radius * 0.2;
            this.ctx.moveTo(eyeX - xSize, eyeY - xSize);
            this.ctx.lineTo(eyeX + xSize, eyeY + xSize);
            this.ctx.moveTo(eyeX + xSize, eyeY - xSize);
            this.ctx.lineTo(eyeX - xSize, eyeY + xSize);
        });
        this.ctx.stroke();
        this.drawChickBeak(centerX, centerY, radius);
    }

    drawDeadChickBeak(centerX, centerY, radius) {
        const beakSize = radius * 0.5;
        const beakY = centerY + radius * 0.5;
        const offsetX = radius * 0.15;
        const offsetY = radius * 0.1;

        this.ctx.fillStyle = '#cc5500';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + offsetX, beakY - beakSize + offsetY);
        this.ctx.lineTo(centerX - beakSize + offsetX, beakY + offsetY);
        this.ctx.lineTo(centerX + beakSize + offsetX, beakY + offsetY);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#994400';
        const lowerBeakSize = beakSize * 0.6;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - lowerBeakSize + offsetX, beakY + offsetY);
        this.ctx.lineTo(centerX + lowerBeakSize + offsetX, beakY + offsetY);
        this.ctx.lineTo(centerX + offsetX, beakY + lowerBeakSize + offsetY);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawChickEyes(centerX, centerY, radius, chick, isDragged) {
        const eyeWidth = radius * 0.6,
            eyeHeight = radius * 1.0,
            eyeDistance = radius * 0.4;
        this.ctx.fillStyle = '#fff';
        [-1, 1].forEach(side => {
            this.ctx.beginPath();
            this.ctx.roundRect(centerX + side * eyeDistance - eyeWidth / 2, centerY - radius * 0.2 - eyeHeight / 2, eyeWidth, eyeHeight, eyeWidth * 0.2);
            this.ctx.fill();
        });

        const pupilSize = isDragged ? eyeWidth * 0.6 : eyeWidth * 0.4;
        const offsetX = isDragged ? 0 : chick.eyeOffsetX;
        const offsetY = isDragged ? 0 : chick.eyeOffsetY;
        this.ctx.fillStyle = '#000';
        [-1, 1].forEach(side => {
            this.ctx.beginPath();
            this.ctx.roundRect(centerX + side * eyeDistance - pupilSize / 2 + offsetX, centerY - radius * 0.2 - pupilSize / 2 + offsetY, pupilSize, pupilSize, pupilSize * 0.2);
            this.ctx.fill();
        });
    }

    drawChickBeak(centerX, centerY, radius, isDragged) {
        const beakSize = radius * 0.5,
            beakY = centerY + radius * 0.5,
            beakGap = isDragged ? 1 : 0;

        if (isDragged && beakGap > 0) {
            this.ctx.fillStyle = '#333';
            const tongueSize = beakSize * 0.7;
            this.ctx.fillRect(centerX - tongueSize / 2, beakY - tongueSize / 2, tongueSize, tongueSize);
        }

        this.ctx.fillStyle = '#ffa500';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, beakY - beakSize - beakGap);
        this.ctx.lineTo(centerX - beakSize, beakY - beakGap);
        this.ctx.lineTo(centerX + beakSize, beakY - beakGap);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#cc7700';
        const lowerBeakSize = beakSize * 0.6;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - lowerBeakSize, beakY + beakGap);
        this.ctx.lineTo(centerX + lowerBeakSize, beakY + beakGap);
        this.ctx.lineTo(centerX, beakY + lowerBeakSize + beakGap);
        this.ctx.closePath();
        this.ctx.fill();
    }
}