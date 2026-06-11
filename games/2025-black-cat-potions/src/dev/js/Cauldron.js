'use strict';


js13k.Cauldron = class extends js13k.LevelObject {


	/**
	 *
	 * @param {js13k.Level} level
	 */
	constructor( level ) {
		super( level, 800, 650 );

		/** @type {Ingredient[]} */
		this.contents = [];

		/** @type {js13k.Animation[]} */
		this._animAddIngredients = [];

		[this.cnvFluid, this.ctxFluid] = js13k.Renderer.getOffscreenCanvas( this.w * 0.72, this.h * 0.28 );

		const x = this.w / 2;
		const y = this.h * 0.2 + 2;

		this._gradient = this.ctx.createRadialGradient(
			x, y + this.h * 0.37, this.h * 0.14,
			x, y + this.h * 0.37, this.h * 0.82
		);
		this._gradient.addColorStop( 0, '#666' );
		this._gradient.addColorStop( 1, '#444' );

		this._gradientFire = this.ctx.createLinearGradient(
			x, y + this.h,
			x, y
		);
		this._gradientFire.addColorStop( 0, '#730' );
		this._gradientFire.addColorStop( 0.5, '#ff000000' );
	}


	/**
	 *
	 * @private
	 * @param {number} x
	 * @param {number} y
	 * @param {number} timeOffset
	 */
	_drawBubble( x, y, timeOffset ) {
		const state = ( ( this.level.timer + timeOffset ) / 25 ) % 4;

		this.ctx.lineWidth = 3;
		this.ctx.strokeStyle = '#ffffff4f';
		this.ctx.beginPath();

		if( state < 3 ) {
			const progress = state / 3;
			this.ctx.lineWidth *= progress;
			this.ctx.arc( x, y, progress * progress * 12, Math.PI, 0 );
		}
		else {
			const alpha = 1 - state + 3;
			this.ctx.globalAlpha = alpha * alpha * alpha;
			this.ctx.moveTo( x, y - 8 );
			this.ctx.lineTo( x, y - 18 );
			this.ctx.moveTo( x - 7, y - 6 );
			this.ctx.lineTo( x - 15, y - 13 );
			this.ctx.moveTo( x + 7, y - 6 );
			this.ctx.lineTo( x + 15, y - 13 );
		}

		this.ctx.stroke();
		this.ctx.globalAlpha = 1;
	}


	/**
	 *
	 * @private
	 */
	_updateFluid() {
		const w = this.cnvFluid.width;
		const h = this.cnvFluid.height;

		const rx = w / 2;
		const ry = h / 2;

		this.ctxFluid.clearRect( 0, 0, w, h );

		// Just water
		let fluidColor = '#2d7feb';

		const numIngs = this.contents.length;

		if( numIngs == 1 ) {
			fluidColor = this.contents[0].fluidColor;
		}
		else if( numIngs > 1 ) {
			const check = [
				[js13k.IngredientCold, js13k.IngredientWarm, js13k.IngredientEmotion, js13k.IngredientLife],
				[js13k.IngredientWarm, js13k.IngredientLife, js13k.IngredientEmotion],
				[js13k.IngredientCold, js13k.IngredientLife, js13k.IngredientEmotion],
				[js13k.IngredientCold, js13k.IngredientWarm, js13k.IngredientEmotion],
				[js13k.IngredientCold, js13k.IngredientWarm, js13k.IngredientLife],
				[js13k.IngredientCold, js13k.IngredientWarm],
				[js13k.IngredientCold, js13k.IngredientLife],
				[js13k.IngredientCold, js13k.IngredientEmotion],
				[js13k.IngredientWarm, js13k.IngredientLife],
				[js13k.IngredientWarm, js13k.IngredientEmotion],
				[js13k.IngredientLife, js13k.IngredientEmotion],
			];

			/** @type {string[]} */
			let colors = null;

			for( let i = 0; i < check.length; i++ ) {
				const entry = check[i];
				let isMatch = true;
				colors = [];

				for( let j = 0; j < entry.length; j++ ) {
					if( !this.contents.includes( entry[j] ) ) {
						isMatch = false;
						break;
					}

					colors.push( entry[j].fluidColor );
				}

				if( isMatch ) {
					break;
				}
			}

			const r = [];
			const g = [];
			const b = [];

			colors.forEach( c => {
				r.push( parseInt( c.substring( 1, 3 ), 16 ) );
				g.push( parseInt( c.substring( 3, 5 ), 16 ) );
				b.push( parseInt( c.substring( 5, 7 ), 16 ) );
			} );

			this.colorTimer ??= new js13k.Timer( this.level, 2 );
			this.colorStart ??= 0;
			this.colorEnd ??= 1;

			if( this.colorTimer.elapsed() ) {
				const steps = colors.length;
				this.colorStart = ++this.colorStart % steps;
				this.colorEnd = ++this.colorEnd % steps;
				this.colorTimer.set( 2 );
			}

			const progress = this.colorTimer.progress();
			const pRev = 1 - progress;

			let rNow = r[this.colorStart] * pRev + r[this.colorEnd] * progress;
			let gNow = g[this.colorStart] * pRev + g[this.colorEnd] * progress;
			let bNow = b[this.colorStart] * pRev + b[this.colorEnd] * progress;

			fluidColor = `rgb(${rNow},${gNow},${bNow})`;
		}

		this.ctxFluid.fillStyle = fluidColor;
		this.ctxFluid.beginPath();
		this.ctxFluid.ellipse( w / 2, h / 2, rx, ry, 0, 0, Math.PI * 2 );
		this.ctxFluid.fill();
	}


	/**
	 *
	 * @param {Ingredient} ingredient
	 */
	addContent( ingredient ) {
		if( this.contents.includes( ingredient ) ) {
			return;
		}

		this._animAddIngredients.push( new js13k.Animation(
			2,
			( progress, params ) => {
				const progRev = 1 - progress;

				this.ctx.strokeStyle = '#ffffff7f';
				this.ctx.lineWidth = Math.max( 2, 10 * progRev );
				this.ctx.globalAlpha = progRev;

				this.ctx.beginPath();
				this.ctx.ellipse(
					params.x, params.y - 20,
					Math.max( 0.5, 200 * progress ),
					Math.max( 0.5, 60 * progress ),
					0, 0, Math.PI * 2
				);
				this.ctx.stroke();

				const f = ( Math.sin( progress * Math.PI ) + 1 ) / 2;
				const offsetX = 20 + 100 * progress;
				const offsetY = 160 * f - 20;
				const r = Math.max( 2, 10 * progRev );

				this.ctx.lineWidth = 1;
				this.ctx.fillStyle = ingredient.fluidColor;

				this.ctx.beginPath();
				this.ctx.arc( params.x - offsetX, params.y - offsetY, r, 0, Math.PI * 2 );
				this.ctx.fill();
				this.ctx.stroke();

				this.ctx.beginPath();
				this.ctx.arc( params.x + offsetX, params.y - offsetY, r, 0, Math.PI * 2 );
				this.ctx.fill();
				this.ctx.stroke();

				this.ctx.globalAlpha = 1;
			},
			thisAnim => {
				const index = this._animAddIngredients.indexOf( thisAnim );

				if( index >= 0 ) {
					this._animAddIngredients.splice( index, 1 );
				}
			},
		) );

		js13k.Audio.play( js13k.Audio.drop );

		this.contents.push( ingredient );

		this.colorTimer = null;
		this.colorStart = null;
		this.colorEnd = null;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		this.ctx.clearRect( 0, 0, this.w, this.h );

		const x = this.w / 2;
		const y = this.h * 0.2 + 2;
		const same = [0, 0, Math.PI * 2];

		this.ctx.strokeStyle = '#444';
		this.ctx.lineWidth = 4;

		// big bottom
		this.ctx.fillStyle = this._gradient;
		this.ctx.beginPath();
		this.ctx.ellipse( x, y + this.h * 0.33, this.w * 0.5, this.h * 0.47, ...same );
		this.ctx.fill();

		this.ctx.fillStyle = this._gradientFire;
		this.ctx.beginPath();
		this.ctx.ellipse( x, y + this.h * 0.33, this.w * 0.5, this.h * 0.47, ...same );
		this.ctx.fill();

		this.ctx.fillStyle = this._gradient;

		// upper rim
		this.ctx.beginPath();
		this.ctx.ellipse( x, y, this.w * 0.45, this.h * 0.2, ...same );
		this.ctx.fill();
		this.ctx.stroke();

		// inner area
		this.ctx.fillStyle = '#444';
		this.ctx.beginPath();
		this.ctx.ellipse( x, y - this.h * 0.01, this.w * 0.39, this.h * 0.15, ...same );
		this.ctx.fill();

		// fluid
		let xFluid = x / 2 - 90;
		let yFluid = y - this.h * 0.06;
		this._updateFluid();
		this.ctx.save();
		this.ctx.clip();
		this.ctx.drawImage( this.cnvFluid, xFluid, yFluid );
		this.ctx.restore();

		// bubbles
		this._drawBubble( x - 180, y + 25, 75 );
		this._drawBubble( x - 100, y + 50, 50 );
		this._drawBubble( x - 30, y + 10, 0 );
		this._drawBubble( x + 30, y + 60, 25 );
		this._drawBubble( x + 100, y + 20, 50 );
		this._drawBubble( x + 180, y + 40, 75 );

		this._animAddIngredients.forEach( anim => anim.do( {
			x: xFluid + this.cnvFluid.width / 2,
			y: yFluid + this.cnvFluid.height / 2
		} ) );

		ctx.drawImage( this.cnv, this.calcCenterX(), js13k.h - this.h + 100 );

		if( Math.random() < 0.01 ) {
			js13k.Audio.play( js13k.Audio.bubble, Math.random() * 0.3 );
		}
	}


	/**
	 *
	 * @param {Ingredient[]} newContent
	 */
	updateContent( newContent ) {
		this.contents = newContent;

		this.colorTimer = null;
		this.colorStart = null;
		this.colorEnd = null;
	}


};