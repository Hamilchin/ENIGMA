'use strict';


js13k.IngredientWarm = {


	name: 'Fire Berries',
	fluidColor: '#a81646',

	x: 320,
	y: 430,
	w: 150,
	h: 150,


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( !this.cnv ) {
			[this.cnv, this.ctx] = js13k.Renderer.getOffscreenCanvas( this.w, this.h );

			// Cork
			const gradient = this.ctx.createLinearGradient(
				42, 0, 42 + this.w - 84, 0
			);
			gradient.addColorStop( 0, '#52381b' );
			gradient.addColorStop( 0.5, '#573b1c' );
			gradient.addColorStop( 1, '#52381b' );

			this.ctx.fillStyle = gradient;
			this.ctx.fillRect( 42, 0, this.w - 84, 52 );

			// Bottle glas
			this.ctx.lineWidth = 4;
			this.ctx.fillStyle = '#ffffff1f';
			this.ctx.strokeStyle = '#ccc';
			this.ctx.beginPath();
			this.ctx.moveTo( 2, 42 );
			this.ctx.lineTo( 2, this.h - 2 );
			this.ctx.lineTo( this.w - 2, this.h - 2 );
			this.ctx.lineTo( this.w - 2, 42 );
			this.ctx.lineTo( this.w - 40, 42 );
			this.ctx.lineTo( this.w - 40, 12 );
			this.ctx.lineTo( 40, 12 );
			this.ctx.lineTo( 40, 42 );
			this.ctx.closePath();
			this.ctx.fill();
			this.ctx.stroke();

			// Content
			const points = [
				// top row
				[15, 80], [35, 90], [55, 96], [75, 96], [95, 96], [115, 90], [135, 80],
				// second row
				[15, 100], [35, 110], [55, 116], [75, 116], [95, 116], [115, 110], [135, 100],
				// third row
				[15, 120], [35, 130], [55, 136], [75, 136], [95, 136], [115, 130], [135, 120],
				// corners
				[17, 136], [133, 136],
				// darker ones
				[25, 85, 0.9], [50, 90, 0.9], [80, 100, 0.9], [105, 95, 0.9], [130, 85, 0.9],
				[20, 105, 0.9], [40, 108, 0.9], [63, 112, 0.9], [98, 114, 0.9], [120, 106, 0.9],
				[22, 125, 0.9], [42, 135, 0.9], [67, 132, 0.9], [85, 125, 0.9], [110, 135, 0.9], [135, 128, 0.9],
			];

			for( let i = 0; i < points.length; i++ ) {
				const p = points[i];
				this.ctx.filter = `brightness(${p[2] || 1})`;

				this.ctx.fillStyle = '#a81646';
				this.ctx.beginPath();
				this.ctx.arc( p[0], p[1], 10, 0, Math.PI * 2 );
				this.ctx.fill();

				this.ctx.fillStyle = '#ffffff17';
				this.ctx.beginPath();
				this.ctx.arc( p[0] + 4, p[1] - 4, 5, 0, Math.PI * 2 );
				this.ctx.fill();
			}
		}

		ctx.drawImage( this.cnv, this.x, this.y );

		if( this.mouseover ) {
			js13k.Level.drawMouseoverText( ctx, this.name, this.x + this.w / 2, this.y + this.h + 35 );
		}
	},


};


js13k.IngredientCold = {


	name: 'Crystal Ice',
	fluidColor: '#6ebec4',

	x: 100,
	y: 430,
	w: 180,
	h: 150,

	/** @type {js13k.Animation[]} */
	_animations: [],


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} timer
	 */
	draw( ctx, timer ) {
		if( !this.cnv ) {
			[this.cnv, this.ctx] = js13k.Renderer.getOffscreenCanvas( this.w, this.h );

			// Content
			this.ctx.fillStyle = this.fluidColor;
			this.ctx.beginPath();
			this.ctx.ellipse( this.w / 2, this.h / 2 + 20, this.w / 2 - 20, this.h / 2 - 40, 0, 0, Math.PI, true );
			this.ctx.fill();

			// Bowl
			const gradient = this.ctx.createRadialGradient(
				this.w / 2, this.h / 2 + 10, 10,
				this.w / 2, this.h / 2 + 10, this.w
			);
			gradient.addColorStop( 0, '#4d5b6e' );
			gradient.addColorStop( 1, '#393e44' );

			this.ctx.fillStyle = gradient;
			this.ctx.beginPath();
			this.ctx.ellipse( this.w / 2, this.h / 2 + 10, this.w / 2, this.h / 2, 0, 0, Math.PI );
			this.ctx.fill();
		}

		ctx.drawImage( this.cnv, this.x, this.y );

		// Sparkles
		if( Math.round( timer % 40 ) == 0 ) {
			const x = this.x + this.w / 2 + ( Math.random() * 2 - 1 ) * 60;
			const y = this.y + this.h / 2 - 5 + ( Math.random() * 2 - 1 ) * 15;

			this._animations.push( new js13k.Animation(
				1,
				progress => {
					ctx.globalAlpha = ( progress > 0.5 ? 1 - progress : progress ) * 2;
					ctx.strokeStyle = '#fff';
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo( x - 2, y );
					ctx.lineTo( x + 2, y );
					ctx.moveTo( x, y - 2 );
					ctx.lineTo( x, y + 2 );
					ctx.stroke();
					ctx.globalAlpha = 1;
				},
				thisAnimation => {
					const index = this._animations.indexOf( thisAnimation );

					if( index >= 0 ) {
						this._animations.splice( index, 1 );
					}
				},
			) );
		}

		this._animations.forEach( anim => anim.do() );

		if( this.mouseover ) {
			js13k.Level.drawMouseoverText( ctx, this.name, this.x + this.w / 2, this.y + this.h + 35 );
		}
	},


};


js13k.IngredientLife = {


	name: 'Dried Herbs',
	fluidColor: '#007744',

	x: 0,
	y: 0,
	w: 700,
	h: 280,

	_animations: [],


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} x
	 * @param {number} y
	 * @param {number} h
	 */
	_drawLeaf( ctx, x, y, h ) {
		ctx.strokeStyle = '#37460e';
		ctx.fillStyle = '#adb639';
		ctx.lineWidth = 2;

		for( let i = y; i < h; i += 20 ) {
			let offsetX = x;
			let progress = i / h;

			if( progress < 0.5 ) {
				offsetX -= progress * 20;
			}
			else {
				offsetX -= ( 1 - progress ) * 20;
			}

			// Branches left and right
			ctx.beginPath();
			ctx.moveTo( offsetX, i );
			ctx.lineTo( offsetX - 30, i + 20 );
			ctx.moveTo( offsetX, i );
			ctx.lineTo( offsetX + 30, i + 20 );
			ctx.stroke();

			// Leaves/Flowers at end of branches
			ctx.beginPath();
			ctx.ellipse( offsetX - 25, i + 18, 5, 7, Math.PI / 4, 0, Math.PI * 2 );
			ctx.ellipse( offsetX + 25, i + 18, 5, 7, Math.PI / -4, 0, Math.PI * 2 );
			ctx.fill();
		}

		// Stem
		ctx.strokeStyle = '#305e25';
		ctx.lineWidth = 4;

		ctx.beginPath();
		ctx.moveTo( x, 0 );
		ctx.quadraticCurveTo( x - 20, h / 2, x, h );
		ctx.stroke();
	},


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} timer
	 */
	draw( ctx, timer ) {
		if( !this.cnv ) {
			[this.cnv, this.ctx] = js13k.Renderer.getOffscreenCanvas( this.w, this.h );

			const step = this.w / 10;

			for( let i = 1; i < 11; i++ ) {
				const x = step * i - 40;
				const y = i % 2 ? -5 : -15;
				const h = this.h * ( i % 2 ? 1 : 0.8 ) - 80 + i * 5;

				this.ctx.filter = `brightness(${0.8 + i * 0.05})`;
				this._drawLeaf( this.ctx, x, y, h );
			}
		}

		// Falling leaves
		if( Math.round( timer % 120 ) == 0 ) {
			const x = this.w / 2 + ( Math.random() * 2 - 1 ) * this.w / 2;
			const y = this.h / 3;

			this._animations.push( new js13k.Animation(
				10,
				progress => {
					const move = Math.sin( progress * 10 );

					ctx.globalAlpha = 1 - progress;
					ctx.fillStyle = '#adb639';
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.ellipse(
						x + move * 10,
						y + progress * 300,
						5, 7,
						( 90 + move * -15 ) * Math.PI / 180,
						0, Math.PI * 2
					);
					ctx.fill();
					ctx.globalAlpha = 1;
				},
				thisAnimation => {
					const index = this._animations.indexOf( thisAnimation );

					if( index >= 0 ) {
						this._animations.splice( index, 1 );
					}
				},
			) );
		}

		this._animations.forEach( anim => anim.do() );

		ctx.drawImage( this.cnv, this.x, this.y );

		if( this.mouseover ) {
			js13k.Level.drawMouseoverText( ctx, this.name, this.x + this.w / 2, this.y + this.h );
		}
	},


};


js13k.IngredientEmotion = {


	name: 'Mindshrooms',
	fluidColor: '#8143a5',

	x: 0,

	get y() {
		return js13k.h - this.h;
	},

	w: 530,
	h: 200,


	/**
	 *
	 * @private
	 * @param {number} x
	 * @param {number} h
	 * @param {number} w
	 * @param {number} brightness
	 */
	_drawMushroom( x, h, w, brightness ) {
		const y = this.h - h;

		this.ctx.filter = `brightness(${brightness})`;

		this.ctx.fillStyle = '#ddd';
		this.ctx.fillRect( x, this.h - h, w, h );

		const gradient = this.ctx.createLinearGradient(
			x, this.h - h,
			x + w, this.h - h
		);
		gradient.addColorStop( 0, '#0000002f' );
		gradient.addColorStop( 1, '#00000000' );

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect( x, this.h - h, w, h );

		this.ctx.fillStyle = '#0000001f';
		this.ctx.fillRect( x, this.h - h, w, w / 10 );

		const gradientTop = this.ctx.createRadialGradient(
			x + w / 2, y, w,
			x + w / 2, y, w * 2
		);
		gradientTop.addColorStop( 0, '#8143a5' );
		gradientTop.addColorStop( 1, '#6e4088' );

		this.ctx.fillStyle = gradientTop;
		this.ctx.beginPath();
		this.ctx.ellipse( x + w / 2, y, w * 2, w * 1.5, 0, 0, Math.PI, true );
		this.ctx.fill();
	},


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( !this.cnv ) {
			[this.cnv, this.ctx] = js13k.Renderer.getOffscreenCanvas( this.w, this.h );

			this._drawMushroom( 0, 75, 25, 0.4 );
			this._drawMushroom( 30, 130, 45, 0.6 );
			this._drawMushroom( 100, 80, 30, 0.7 );
			this._drawMushroom( 60, 40, 20, 0.75 );
			this._drawMushroom( 225, 30, 25, 0.65 );
			this._drawMushroom( 350, 20, 25, 0.65 );
			this._drawMushroom( 150, 95, 30, 0.85 );
			this._drawMushroom( 280, 70, 50, 0.9 );
			this._drawMushroom( 410, 80, 30, 0.95 );
			this._drawMushroom( 110, 30, 10, 1 );
			this._drawMushroom( 200, 45, 20, 1 );
			this._drawMushroom( 320, 35, 20, 1.1 );
			this._drawMushroom( 450, 25, 15, 1 );
		}

		ctx.drawImage( this.cnv, this.x, this.y );

		if( this.mouseover ) {
			js13k.Level.drawMouseoverText( ctx, this.name, this.x + this.w / 2, this.y );
		}
	},


};
