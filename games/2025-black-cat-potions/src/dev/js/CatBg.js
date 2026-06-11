'use strict';


js13k.CatBg = class extends js13k.LevelObject {


	/**
	 *
	 * @param {js13k.Level} level
	 */
	constructor( level ) {
		super( level, 800, 800 );

		this.offsetY = 0;
	}


	/**
	 *
	 * @private
	 * @param {number} w
	 * @returns {number}
	 */
	_centerX( w ) {
		return ( this.w - w ) / 2;
	}


	/**
	 *
	 * @private
	 * @param {number} bodyW
	 */
	_drawEars( bodyW ) {
		let y = 260;
		let x = this._centerX( bodyW ) - 20;
		let w = 80;
		let h = 100;

		this.ctx.fillStyle = '#000';
		this.ctx.strokeStyle = '#000';

		// Left ear
		this.ctx.beginPath();
		this.ctx.moveTo( x, y );
		this.ctx.lineTo( x + 10, y - h );
		this.ctx.lineTo( x + w, y );
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.stroke();

		// Right ear
		this.ctx.beginPath();
		this.ctx.moveTo( this.w - x, y );
		this.ctx.lineTo( this.w - x - 10, y - h );
		this.ctx.lineTo( this.w - x - w, y );
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.stroke();

		this.ctx.fillStyle = '#111';
		x += 15;
		h -= 45;
		w -= 35;

		this.ctx.beginPath();
		this.ctx.moveTo( x, y );
		this.ctx.lineTo( x + 5, y - h );
		this.ctx.lineTo( x + w, y );
		this.ctx.fill();

		this.ctx.beginPath();
		this.ctx.moveTo( this.w - x, y );
		this.ctx.lineTo( this.w - x - 5, y - h );
		this.ctx.lineTo( this.w - x - w, y );
		this.ctx.fill();
	}


	/**
	 *
	 * @private
	 * @param {number} bodyW
	 */
	_drawFace( bodyW ) {
		let y = 140;
		let x = this._centerX( bodyW );
		const bodyWHalf = bodyW / 2;

		// Whiskers
		let yWhisker = y + 270;

		this.ctx.strokeStyle = '#000';
		this.ctx.lineWidth = 6;
		this.ctx.beginPath();

		// left
		this.ctx.moveTo( x, yWhisker );
		this.ctx.lineTo( x - 100, yWhisker - 10 );
		this.ctx.moveTo( x, yWhisker + 10 );
		this.ctx.lineTo( x - 100, yWhisker + 10 );
		this.ctx.moveTo( x, yWhisker + 20 );
		this.ctx.lineTo( x - 100, yWhisker + 30 );
		// right
		this.ctx.moveTo( this.w - x, yWhisker );
		this.ctx.lineTo( this.w - x + 100, yWhisker - 10 );
		this.ctx.moveTo( this.w - x, yWhisker + 10 );
		this.ctx.lineTo( this.w - x + 100, yWhisker + 10 );
		this.ctx.moveTo( this.w - x, yWhisker + 20 );
		this.ctx.lineTo( this.w - x + 100, yWhisker + 30 );

		this.ctx.stroke();

		// Mouth
		let rx = 22;
		let ry = 16;
		let yMouth = y + 300;

		this.ctx.strokeStyle = '#aaa';
		this.ctx.lineWidth = 4;
		this.ctx.beginPath();
		this.ctx.ellipse( x + bodyWHalf - rx, yMouth, rx, ry, 0, 0, Math.PI * 0.9 );
		this.ctx.stroke();
		this.ctx.beginPath();
		this.ctx.ellipse( x + bodyWHalf + rx, yMouth, rx, ry, 0, Math.PI * 0.1, Math.PI );
		this.ctx.stroke();

		// Eyes
		let yEyes = y + 240;
		let rX = 40;
		let rY = 30;

		this.ctx.fillStyle = '#ff0';
		this.ctx.beginPath();
		this.ctx.ellipse( x + bodyW * 0.15, yEyes, rX, rY, 0, 0, Math.PI * 2 );
		this.ctx.ellipse( x + bodyW * 0.85, yEyes, rX, rY, 0, 0, Math.PI * 2 );
		this.ctx.fill();

		rX = 35;
		rY = 25;
		this.ctx.fillStyle = '#000';
		this.ctx.beginPath();
		this.ctx.ellipse( x + bodyW * 0.16, yEyes + 10, rX, rY, 0, 0, Math.PI * 2 );
		this.ctx.ellipse( x + bodyW * 0.84, yEyes + 10, rX, rY, 0, 0, Math.PI * 2 );
		this.ctx.fill();
	}


	/**
	 *
	 * @private
	 */
	_drawHat() {
		let y = 220;

		this.ctx.fillStyle = '#6a267a';
		this.ctx.beginPath();

		this.ctx.moveTo( 0, y + 100 );
		this.ctx.lineTo( 150, y );
		this.ctx.lineTo( 250, y );

		this.ctx.lineTo( 320, y - 200 );
		this.ctx.lineTo( this.w - 100, y - 150 );
		this.ctx.lineTo( this.w - 300, y - 100 );

		this.ctx.lineTo( this.w - 250, y );
		this.ctx.lineTo( this.w - 150, y );
		this.ctx.lineTo( this.w, y + 100 );
		this.ctx.closePath();

		this.ctx.fill();

		// Hat band
		this.ctx.fillStyle = '#54245f';
		this.ctx.beginPath();
		this.ctx.moveTo( 240, y + 30 );
		this.ctx.lineTo( 256, y - 30 );
		this.ctx.lineTo( this.w - 260, y - 30 );
		this.ctx.lineTo( this.w - 240, y + 30 );
		this.ctx.closePath();
		this.ctx.fill();
	}


	/**
	 *
	 * @private
	 */
	_drawTail() {
		this.ctx.strokeStyle = '#000';
		this.ctx.lineWidth = 40;
		this.ctx.beginPath();

		const startX = this.w / 2;
		const startY = this.h;
		this.ctx.moveTo( startX, startY );

		const endX = this.w - 20;
		const endY = this.h / 2 + 60;
		this.ctx.bezierCurveTo( startX + 300, startY, endX - 200, endY, endX, endY );

		this.ctx.stroke();
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( this._needsRedraw ) {
			this.ctx.clearRect( 0, 0, this.w, this.h );

			const bodyW = this.w * 0.4;
			const bodyX = this._centerX( bodyW );

			// Body
			this.ctx.fillStyle = '#000';
			this.ctx.beginPath();
			this.ctx.fillRect( bodyX, 250, bodyW, this.h - 250 );
			this.ctx.ellipse( bodyX, this.h - 420, 150, 15, 90 * Math.PI / 180, 0, Math.PI );
			this.ctx.ellipse( bodyX + bodyW, this.h - 420, 150, 15, 270 * Math.PI / 180, 0, Math.PI );
			this.ctx.closePath();
			this.ctx.fill();

			this._drawFace( bodyW );
			this._drawHat();
			this._drawEars( bodyW );
			this._drawTail();
		}

		ctx.drawImage(
			this.cnv,
			this.calcCenterX(),
			js13k.h - this.level.cauldron.h - this.h / 2 + this.offsetY
		);
	}


	/**
	 *
	 * @param {number} timer
	 */
	update( timer ) {
		timer *= 0.05;
		this.offsetY = Math.sin( timer ) * 4;
	}


};