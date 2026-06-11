'use strict';


js13k.Button = class {


	static INTRO = 1;
	static BOTTLE = 2;
	static RESTART = 3;


	/**
	 *
	 * @param {number} id
	 * @param {number} x
	 * @param {number} y
	 * @param {number} [w = 100]
	 * @param {number} [h = 100]
	 */
	constructor( id, x, y, w = 100, h = 100 ) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( !this.cnv ) {
			[this.cnv, this.ctx] = js13k.Renderer.getOffscreenCanvas( this.w, this.h );

			if( this.id == js13k.Button.INTRO ) {
				this.ctx.fillStyle = '#ff0';
				this.ctx.beginPath();
				this.ctx.roundRect( 2, 2, this.w - 4, this.h - 4, 20 );
				this.ctx.fill();

				this.ctx.fillStyle = '#000';
				this.ctx.font = '600 20px ' + js13k.FONT_SANS;
				this.ctx.textAlign = 'center';
				this.ctx.textBaseline = 'middle';
				this.ctx.fillText( 'Open Shop!', this.w / 2, this.h / 2 );
			}
			else {
				this.ctx.fillStyle = '#000';
				this.ctx.strokeStyle = '#fff';
				this.ctx.lineWidth = 3;
				this.ctx.beginPath();
				this.ctx.arc( this.w / 2, this.h / 2, this.w / 2 - 2, 0, Math.PI * 2 );
				this.ctx.fill();
				this.ctx.stroke();

				if( this.id == js13k.Button.BOTTLE ) {
					const w3 = this.w / 3;

					this.ctx.fillStyle = '#1e61ad';
					this.ctx.beginPath();
					this.ctx.moveTo( w3 - 10, 50 );
					this.ctx.lineTo( w3 * 2 + 6, 50 );
					this.ctx.lineTo( w3 + 7, this.h - 18 );
					this.ctx.lineTo( w3 - 16, this.h - 40 );
					this.ctx.closePath();
					this.ctx.fill();

					this.ctx.save();
					this.ctx.translate( this.w / 2, this.h / 2 );
					this.ctx.rotate( 45 * Math.PI / 180 );
					this.ctx.translate( -this.w / 2, -this.h / 2 );

					this.ctx.beginPath();
					this.ctx.moveTo( w3, this.h - 20 );
					this.ctx.lineTo( w3 * 2, this.h - 20 );
					this.ctx.lineTo( w3 * 2, 35 );
					this.ctx.lineTo( w3 * 1.7, 35 );
					this.ctx.lineTo( w3 * 1.7, 15 );
					this.ctx.lineTo( w3 * 1.3, 15 );
					this.ctx.lineTo( w3 * 1.3, 35 );
					this.ctx.lineTo( w3, 35 );
					this.ctx.closePath();

					this.ctx.fillStyle = '#ffffff3f';
					this.ctx.fill();

					this.ctx.stroke();

					this.ctx.fillStyle = '#70430f';
					this.ctx.fillRect( w3 * 1.3 + 1.5, 9, w3 * 0.4 - 3, 12 );

					this.ctx.restore();
				}
				else if( this.id == js13k.Button.RESTART ) {
					// Curved arrow
					this.ctx.beginPath();
					this.ctx.arc( this.w / 2, this.h / 2, this.w / 2 - 25, Math.PI * 0.75, Math.PI * 1.5 );
					this.ctx.moveTo( this.w / 2 - 8, 15 );
					this.ctx.lineTo( this.w / 2 + 2, 25 );
					this.ctx.lineTo( this.w / 2 - 8, 35 );
					this.ctx.stroke();

					// Curved arrow
					this.ctx.beginPath();
					this.ctx.arc( this.w / 2, this.h / 2, this.w / 2 - 25, Math.PI * 1.75, Math.PI / 2 );
					this.ctx.moveTo( this.w / 2 + 8, this.h - 15 );
					this.ctx.lineTo( this.w / 2 - 2, this.h - 25 );
					this.ctx.lineTo( this.w / 2 + 8, this.h - 35 );
					this.ctx.stroke();
				}
			}
		}

		let text = null;

		if( this.id == js13k.Button.INTRO ) {
			this.x = ( js13k.w - this.w ) / 2;
		}
		else if( this.id == js13k.Button.BOTTLE ) {
			this.x = js13k.w / 2 + 410;
			this.y = 530;
			text = 'Finish Potion';
		}
		else if( this.id == js13k.Button.RESTART ) {
			this.x = ( js13k.w - 100 ) / 2;
			this.y = js13k.h / 2 + 280;
			text = 'Pour Away';
		}

		ctx.globalAlpha = ( this.id == js13k.Button.INTRO || this.mouseover ) ? 1 : 0.6;
		ctx.drawImage( this.cnv, this.x, this.y );
		ctx.globalAlpha = 1;

		if( this.mouseover && text ) {
			js13k.Level.drawMouseoverText( ctx, text, this.x + this.w / 2, this.y + this.h + 10 );
		}
	}


};


js13k.Level = class {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.timer = 0;
		this.ordersCorrectGoal = 30;
		this.ordersWrongLimit = 10;

		this.isEndlessGame = false;
		this.isGameOver = false;

		/** @type {js13k.Animation[]} */
		this.animations = [];

		// 0: Intro
		// 1: Starting with simple potions
		// 2: More ingredients, potions with more ingredients
		// 3: Again more ingredients and potions with more ingredients
		this.stage = -1;

		/** @type {PotionOrder[]} */
		this.orders = [];

		/** @type {PotionOrder[]} */
		this.doneOrders = [];

		/** @type {PotionOrder[]} */
		this.failedOrders = [];

		/** @type {PotionOrder?} */
		this.currentOrder = null;

		/** @type {Ingredient[]} */
		this.ingredients = [];

		this.btnIntroStart = new js13k.Button( js13k.Button.INTRO, 0, 390, 200, 40 );
		this.btnBottle = new js13k.Button( js13k.Button.BOTTLE );
		this.btnRestart = new js13k.Button( js13k.Button.RESTART );

		this.catBg = new js13k.CatBg( this );
		this.catFg = new js13k.CatFg( this );
		this.cauldron = new js13k.Cauldron( this );

		this.changeStage( 0 );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawButtons( ctx ) {
		this.btnBottle.draw( ctx );
		this.btnRestart.draw( ctx );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawFog( ctx ) {
		const w = 700;
		const h = 320;

		if( !this._cnvFog ) {
			[this._cnvFog, this._ctxFog] = js13k.Renderer.getOffscreenCanvas( w, h );
			this._ctxFog.fillStyle = '#ffffff0f';

			const circles = [155, 120, 90, 70, 50, 40];
			let sum = 0;

			this._ctxFog.beginPath();

			for( let i = 0; i < circles.length; i++ ) {
				const r = circles[i];
				this._ctxFog.arc( sum + r, h - r, r, 0, Math.PI * 2 );
				this._ctxFog.closePath();
				sum += r * 1.25;
			}

			this._ctxFog.fill();
		}

		const offsetX = Math.sin( this.timer / 60 ) * 10 - 20;

		const y = js13k.h - h + 40;
		ctx.drawImage( this._cnvFog, offsetX, y );
		ctx.drawImage( this._cnvFog, offsetX - 215, y + 10 );

		const s = js13k.Renderer.scale;
		const x = js13k.w - w - offsetX;
		ctx.setTransform( -s, 0, 0, s, s * ( x + w ), s * y );
		ctx.drawImage( this._cnvFog, 0, 0 );
		ctx.drawImage( this._cnvFog, -155, 10 );
		ctx.setTransform( s, 0, 0, s, 0, 0 );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawGameOver( ctx ) {
		ctx.fillStyle = '#0000004f';
		ctx.fillRect( 0, 0, js13k.w, js13k.h );

		const w = 600;
		const h = 125;
		const x = ( js13k.w - w ) / 2;
		ctx.fillStyle = '#000';
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 2;
		ctx.shadowColor = '#700';
		ctx.shadowBlur = 100;
		ctx.beginPath();
		ctx.roundRect( x, 200, w, h, 4 );
		ctx.fill();
		ctx.stroke();
		ctx.shadowBlur = 0;

		ctx.fillStyle = '#fff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';

		ctx.font = '500 28px ' + js13k.FONT_SANS;
		ctx.fillText( "Shop's closed (◞ ᆺ ◟)", x + w / 2, 230 );

		ctx.font = '500 20px ' + js13k.FONT_SANS;
		ctx.fillText( 'There were too many complaints.', x + w / 2, 280 );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawIngredients( ctx ) {
		// Shelves
		ctx.fillStyle = '#683f24';
		ctx.fillRect( 80, 580, 420, 25 );
		ctx.fillStyle = '#0000001f';
		ctx.fillRect( 80, 603, 420, 2 );

		for( let i = 0; i < this.ingredients.length; i++ ) {
			const ing = this.ingredients[i];
			ing.draw( ctx, this.timer );
		}
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawIntro( ctx ) {
		ctx.fillStyle = '#0000004f';
		ctx.fillRect( 0, 0, js13k.w, js13k.h );

		const w = 640;
		const h = 256;
		const x = ( js13k.w - w ) / 2;
		ctx.fillStyle = '#000';
		ctx.strokeStyle = '#ff0';
		ctx.lineWidth = 2;
		ctx.shadowColor = '#770';
		ctx.shadowBlur = 100;
		ctx.beginPath();
		ctx.roundRect( x, 200, w, h, 4 );
		ctx.fill();
		ctx.stroke();
		ctx.shadowBlur = 0;

		ctx.fillStyle = '#fff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';

		ctx.font = 'italic 600 28px ' + js13k.FONT_SANS;
		ctx.fillText( 'Welcome to Black Cat Potions!', x + w / 2, 230 );

		ctx.font = '500 20px ' + js13k.FONT_SANS;
		ctx.fillText( 'Figure out what your customer wants, then create a', x + w / 2, 280 );
		ctx.fillText( 'potion for them with the ingredients on the left.', x + w / 2, 310 );
		ctx.fillText( 'You are only allowed a certain number of mistakes total.', x + w / 2, 350 );

		this.btnIntroStart.draw( ctx );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawOrder( ctx ) {
		if( !this.currentOrder ) {
			return;
		}

		const co = this.currentOrder;
		const timeProgress = co.timer.progress();
		const animProgress = co.animationTimer.progress();
		const potion = co.potion;
		const lines = co.desc.split( '\n' );
		const hasScore = typeof co.score === 'number';

		const s = js13k.Renderer.scale;
		let w = 350;
		let h = 100 + lines.length * 24;
		let x = js13k.w - ( w + 40 ) * Math.sqrt( hasScore ? 1 : animProgress );
		let y = 400;

		if( hasScore ) {
			const x2 = js13k.w - w / 2 - 40;
			const y2 = 400 + h / 2 - 160 * animProgress;

			const colors = {
				'-1': '#f00',
				'0': '#fff',
				'1': '#ff0',
			};

			ctx.globalAlpha = 1 - ( animProgress * animProgress );
			ctx.lineCap = 'round';
			ctx.lineWidth = 10;
			ctx.fillStyle = ctx.strokeStyle = colors[co.score.toString()];

			ctx.beginPath();
			ctx.arc( x2 - 30, y2, 10, 0, Math.PI * 2 );
			ctx.arc( x2 + 30, y2, 10, 0, Math.PI * 2 );
			ctx.fill();

			ctx.beginPath();
			ctx.arc( x2, y2 + 30, 80, 0, Math.PI * 2 );
			ctx.stroke();

			if( co.score == 1 ) {
				ctx.beginPath();
				ctx.ellipse( x2, y2 + 45, 35, 20, 0, 0, Math.PI );
				ctx.stroke();
			}
			else if( co.score == -1 ) {
				ctx.beginPath();
				ctx.ellipse( x2, y2 + 60, 35, 20, 0, Math.PI, 0 );
				ctx.stroke();
			}
			else if( co.score == 0 ) {
				ctx.beginPath();
				ctx.moveTo( x2 - 35, y2 + 50 );
				ctx.lineTo( x2 + 35, y2 + 50 );
				ctx.stroke();
			}

			ctx.globalAlpha = 1;

			y += ( js13k.h - 390 ) * animProgress * animProgress;
			const centerY = y + h / 2;

			ctx.translate( x, centerY );
			ctx.rotate( 10 * Math.PI / 180 );
			ctx.translate( -x, -centerY );
		}

		// Background
		ctx.fillStyle = '#000';
		ctx.strokeStyle = '#ff0';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.roundRect( x, y, w, h, 4 );
		ctx.fill();
		ctx.stroke();

		// Time left
		ctx.fillStyle = '#ff0';
		ctx.beginPath();
		ctx.roundRect( x, y, Math.max( 1, w * ( 1 - timeProgress ) ), 20, [4, 0, 0] );
		ctx.fill();

		// Text
		ctx.fillStyle = '#fff';
		ctx.textAlign = 'left';
		ctx.font = 'italic 600 22px ' + js13k.FONT_SERIF;

		for( let i = 0; i < lines.length; i++ ) {
			const line = lines[i];
			ctx.fillText( line, x + 20, y + 40 );
			y += 26;
		}

		// Info
		if( potion.ingredients.length > 0 && potion.ingredients.length < 4 ) {
			ctx.font = '500 18px ' + js13k.FONT_SANS;
			ctx.fillText( 'Ingredients: ' + potion.ingredients.length, x + 20, y + 60 );
		}

		ctx.setTransform( s, 0, 0, s, 0, 0 );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawScore( ctx ) {
		ctx.strokeStyle = '#ff0';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'top';
		ctx.font = '600 18px ' + js13k.FONT_MONO;

		const width = 354;
		const x = js13k.w - width - 40;
		let y = 60;

		// Progress on successful orders
		const progressGoal = Math.min( 1, this.doneOrders.length / this.ordersCorrectGoal );

		ctx.fillStyle = '#ff0';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.roundRect( x, y, width, 30, 4 );
		ctx.fill();

		ctx.fillText( 'Done ' + this.doneOrders.length + '/' + this.ordersCorrectGoal, x + width, y + 36 );

		ctx.fillStyle = '#6a267a';
		ctx.beginPath();
		ctx.roundRect( x + 3, y + 3, Math.max( 4, width * progressGoal - 6 ), 24, 4 );
		ctx.fill();

		// Progress on failed orders
		const progressLimit = Math.min( 1, this.failedOrders.length / this.ordersWrongLimit );
		y = 150;

		ctx.fillStyle = '#ff0';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.roundRect( x, y, width, 30, 4 );
		ctx.fill();

		ctx.fillText( 'Wrong ' + this.failedOrders.length + '/' + this.ordersWrongLimit, x + width, y + 36 );

		ctx.fillStyle = '#f00';
		ctx.beginPath();
		ctx.roundRect( x + 3, y + 3, Math.max( 4, width * progressLimit - 6 ), 24, 4 );
		ctx.fill();
	}


	/**
	 *
	 * @private
	 * @param {number} stage
	 * @returns {PotionOrder[]}
	 */
	_generateOrders( stage ) {
		/** @type {Potion[]} */
		const list = [];

		let timeLimit = 75;

		if( stage < 2 ) {
			list.push(
				js13k.Potion.Water,
				js13k.Potion.CoolingPotion,
				js13k.Potion.WarmingPotion,
				js13k.Potion.ColdWithHot,
			);

			js13k.shuffle( list );
		}
		else if( stage == 2 ) {
			timeLimit = 55;

			list.push(
				js13k.Potion.Water,
				js13k.Potion.CoolingPotion,
				js13k.Potion.WarmingPotion,
				js13k.Potion.ColdWithHot,
				js13k.Potion.HealthDrink,
				js13k.Potion.FruitTea,
				js13k.Potion.ColdWarmHealthy,
				js13k.Potion.RefreshingEnergizer,
				js13k.Potion.RefreshingEnergizer,
			);

			js13k.shuffle( list );

			// Start with a potion using the new ingredient
			list.splice( 0, 0, js13k.Potion.HealthDrink );
		}
		else if( stage > 2 ) {
			timeLimit = 55; // will get reduced further in `nextOrder()` depending on success so far

			list.push(
				js13k.Potion.Water,
				js13k.Potion.CoolingPotion,
				js13k.Potion.WarmingPotion,
				js13k.Potion.ColdWithHot,
				js13k.Potion.HealthDrink,
				js13k.Potion.FruitTea,
				js13k.Potion.ColdWarmHealthy,
				js13k.Potion.RefreshingEnergizer,
				js13k.Potion.CalmingPotion,
				js13k.Potion.MeditativePotion,
				js13k.Potion.MeditativePotion,
				js13k.Potion.TeeAndBlanketPotion,
				js13k.Potion.WarmHealHead,
				js13k.Potion.AmplitudePotion,
				js13k.Potion.AmplitudePotion,
				js13k.Potion.HotPotPotion,
			);

			js13k.shuffle( list );

			// Start with potions using the new ingredient
			list.splice( 0, 0, js13k.Potion.TeeAndBlanketPotion );
			list.splice( 0, 0, js13k.Potion.CalmingPotion );
		}

		return list.map( potion => {
			return {
				potion: potion,
				timeLimit: timeLimit,
			};
		} );
	}


	/**
	 *
	 * @private
	 * @param {Ingredient} ingredient
	 */
	_selectIngredient( ingredient ) {
		this.cauldron.addContent( ingredient );
	}


	/**
	 *
	 * @param {number} newStage
	 */
	changeStage( newStage ) {
		if( this.stage == newStage ) {
			return;
		}

		this.stage = newStage;

		// Stage 1
		this.ingredients = [
			js13k.IngredientWarm,
			js13k.IngredientCold,
		];

		if( newStage >= 2 ) {
			this.ingredients.push(
				js13k.IngredientLife,
			);
		}

		if( newStage >= 3 ) {
			this.ingredients.push(
				js13k.IngredientEmotion,
			);
		}

		if( newStage > 0 ) {
			this.orders = this._generateOrders( newStage );
			this.nextOrder();
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		this._drawFog( ctx );

		this.catBg.draw( ctx );
		this.cauldron.draw( ctx );
		this.catFg.draw( ctx );

		this._drawIngredients( ctx );
		this._drawScore( ctx );

		if( this.isGameOver ) {
			this._drawGameOver( ctx );
			return;
		}

		this._drawOrder( ctx );
		this._drawButtons( ctx );

		if( this.stage == 0 ) {
			this._drawIntro( ctx );
		}

		this.animations.forEach( anim => anim.do() );
		this._animGoal?.do( { ctx } );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {string} text
	 * @param {number} x
	 * @param {number} y
	 */
	static drawMouseoverText( ctx, text, x, y ) {
		ctx.save();

		const w = text.length * 18;
		ctx.filter = 'blur(20px)';
		ctx.fillStyle = '#000';
		ctx.fillRect( x - w / 2, y, w, 32  );
		ctx.filter = 'blur(0)';

		ctx.fillStyle = '#fff';
		ctx.font = 'italic 600 32px ' + js13k.FONT_SERIF;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.fillText( text, x, y );

		ctx.restore();
	}


	/**
	 *
	 * @param {Ingredient[]?} contents
	 * @returns {Potion?}
	 */
	getPotion( contents ) {
		if( !contents ) {
			return null;
		}

		const numIngredients = contents.length;

		if( numIngredients == 0 ) {
			return js13k.Potion.Water;
		}

		for( const key in js13k.Potion ) {
			/** @type {Potion} */
			const potion = js13k.Potion[key];

			if( potion.ingredients.length != numIngredients ) {
				continue;
			}

			let numMatches = 0;

			for( const ingredient of potion.ingredients ) {
				if( contents.includes( ingredient ) ) {
					numMatches++;
				}
			}

			if( numMatches == numIngredients ) {
				return potion;
			}
		}

		return null;
	}


	/**
	 *
	 * @param {number[]} pos - [x, y]
	 * @param {object}   aabb
	 * @param {number}   aabb.x
	 * @param {number}   aabb.y
	 * @param {number}   aabb.w
	 * @param {number}   aabb.h
	 * @returns {boolean}
	 */
	isInside( pos, aabb ) {
		return pos[0] >= aabb.x &&
			pos[0] <= aabb.x + aabb.w &&
			pos[1] >= aabb.y &&
			pos[1] <= aabb.y + aabb.h;
	}


	/**
	 *
	 */
	nextOrder() {
		this.currentOrder = this.orders.splice( 0, 1 )[0];

		let timeLimit = this.currentOrder.timeLimit;

		if( this.stage > 2 ) {
			timeLimit = Math.max( 5, timeLimit - this.doneOrders.length );
		}

		const rnd = Math.round( Math.random() * ( this.currentOrder.potion.desc.length - 1 ) );
		this.currentOrder.desc =this.currentOrder.potion.desc[rnd];
		this.currentOrder.timer = new js13k.Timer( this, timeLimit );
		this.currentOrder.animationTimer = new js13k.Timer( this, 0.7 );
	}


	/**
	 *
	 * @param {number[]} pos - [x, y]
	 */
	onClick( pos ) {
		if( this._clickingDisabled ) {
			return;
		}

		if( this.stage == 0 ) {
			if( this.isInside( pos, this.btnIntroStart ) ) {
				this.changeStage( 1 );
				setTimeout( () => js13k.Audio.play( js13k.Audio.meow ), 10 );
			}
			return;
		}

		if( this.isInside( pos, this.btnBottle ) ) {
			this.verifyPotion( this.cauldron.contents );
			this.cauldron.updateContent( [] );
			return;
		}

		if( this.isInside( pos, this.btnRestart ) ) {
			this.cauldron.updateContent( [] );
			return;
		}

		for( let i = 0; i < this.ingredients.length; i++ ) {
			const ing = this.ingredients[i];

			if( this.isInside( pos, ing ) ) {
				this._selectIngredient( ing );
				return;
			}
		}
	}


	/**
	 *
	 * @param {number[]} pos - [x, y]
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		if( this.isGameOver ) {
			return false;
		}

		let targetFound = false;

		this.btnIntroStart.mouseover = false;
		this.btnBottle.mouseover = false;
		this.btnRestart.mouseover = false;

		if( this.stage == 0 ) {
			targetFound = this.isInside( pos, this.btnIntroStart );
			this.btnIntroStart.mouseover = targetFound;

			return targetFound;
		}

		for( let i = 0; i < this.ingredients.length; i++ ) {
			const ing = this.ingredients[i];
			ing.mouseover = false;

			if( !targetFound && this.isInside( pos, ing ) ) {
				targetFound = true;
				ing.mouseover = true;
			}
		}

		if( !targetFound && this.isInside( pos, this.btnBottle ) ) {
			targetFound = true;
			this.btnBottle.mouseover = true;
		}

		if( !targetFound && this.isInside( pos, this.btnRestart ) ) {
			targetFound = true;
			this.btnRestart.mouseover = true;
		}

		return targetFound;
	}


	/**
	 *
	 * @param {Potion?} potion
	 * @returns {number} Score: -1 for a wrong order, 0 for an alternative potion, +1 for the correct one
	 */
	scoreOrder( potion ) {
		// Not a valid potion
		if( !potion ) {
			return -1;
		}

		// Correct potion
		if( this.currentOrder.potion == potion ) {
			return 1;
		}

		const alternatives = this.currentOrder.potion.alternatives || [];

		if( alternatives.includes( potion ) ) {
			return 0;
		}

		// Wrong potion
		return -1;
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		const numDoneOrders = this.doneOrders.length;

		if( !this.isEndlessGame && numDoneOrders == this.ordersCorrectGoal ) {
			this.isEndlessGame = true;

			setTimeout( () => js13k.Audio.play( js13k.Audio.meow ), 2000 );

			this._animGoal = new js13k.Animation(
				12,
				( progress, params ) => {
					const w = 400;
					const h = 150;
					let x = ( js13k.w - w ) / 2;
					let y = 140;

					// Slide in
					if( progress < 0.2 ) {
						let f = progress / 0.2;
						y = -h + Math.sqrt( f ) * ( h + y );
					}
					// Slide out
					else if( progress > 0.8 ) {
						let f = ( 1 - progress ) / 0.2;
						y = -h + f * f * ( h + y );
					}

					params.ctx.fillStyle = '#000';
					params.ctx.strokeStyle = '#ff0';
					params.ctx.lineWidth = 2;
					params.ctx.shadowColor = '#770';
					params.ctx.shadowBlur = 100;
					params.ctx.beginPath();
					params.ctx.roundRect( x, y, w, h, 4 );
					params.ctx.fill();
					params.ctx.stroke();
					params.ctx.shadowBlur = 0;

					params.ctx.fillStyle = '#ff0';
					params.ctx.font = 'italic 600 28px ' + js13k.FONT_SANS;
					params.ctx.textAlign = 'center';
					params.ctx.textBaseline = 'top';
					params.ctx.fillText( 'Goal achieved', x + w / 2, y + 24 );

					params.ctx.font = '500 20px ' + js13k.FONT_SANS;
					params.ctx.fillText( 'This shop really landed on its feet!', x + w / 2, y + 70 );
					params.ctx.fillText( 'From here on it is endless mode.', x + w / 2, y + 100 );
				},
				_thisAnimation => {
					this._animGoal = null;
				},
			);
			return;
		}

		if( this.failedOrders.length >= this.ordersWrongLimit ) {
			this.isGameOver = true;
			return;
		}

		// Time is up, failed to provide a potion.
		if(
			this.currentOrder &&
			typeof this.currentOrder.score !== 'number' &&
			this.currentOrder.timer?.elapsed()
		) {
			this.verifyPotion();
		}

		if( numDoneOrders == 4 ) {
			this.changeStage( 2 );
		}
		else if( numDoneOrders == 12 ) {
			this.changeStage( 3 );
		}

		this.catBg.update( this.timer );
		this.cauldron.update( this.timer );
		this.catFg.update( this.timer );
	}


	/**
	 *
	 * @param {Ingredient[]?} contents
	 */
	verifyPotion( contents ) {
		if( !this.currentOrder || typeof this.currentOrder.score === 'number' ) {
			return;
		}

		const potion = this.getPotion( contents );
		const result = this.scoreOrder( potion );

		this.currentOrder.score = result;
		this.currentOrder.animationTimer.set( 0.75 );

		js13k.Audio.play( js13k.Audio.score[result.toString()] );

		// Give some time between orders and to play out animation
		this.animations.push( new js13k.Animation(
			0.85,
			_progress => {},
			thisAnimation => {
				const index = this.animations.indexOf( thisAnimation );

				if( index >= 0 ) {
					this.animations.splice( index, 1 );
				}

				if( result > 0 ) {
					this.doneOrders.push( this.currentOrder );
				}
				else if( result < 0 ) {
					this.failedOrders.push( this.currentOrder );
				}

				if( this.orders.length == 0 ) {
					this.orders = this._generateOrders( this.stage );
				}

				this.nextOrder();
			}
		) );
	}


};
