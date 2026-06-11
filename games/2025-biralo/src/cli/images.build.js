/**
 * Converter for Run Length Encoded sprites.
 * Runs RLE internally instead of depending on external editor
 * @see {@link https://github.com/smiley405/RLE-sprite-editor}
 */

import fs from 'fs-extra';
import { glob } from 'glob';
import { intToRGBA,Jimp } from 'jimp';

const discard = ['export/icons'];

const imagesDir = 'images/export/';
const outDir = './media/';
const filePostfix = 'Assets';
const rawfiles = await glob(`${imagesDir}**/*.png`);
const files = rawfiles.filter(val => {
	let accepted = true;
	for (let i = 0; i < discard.length; i++) {
		if (val.includes(discard[i])) {
			accepted = false;
			break;
		}
	} 
	return accepted;
});

console.log(`Reading Images from ${imagesDir}`);
console.log(files);

/**
 * @type {{[name:string]:string[]}}
 */
const outFiles = {};

let decodedFrames = str => str.replace(/(\D)(\d+)/g, (_, char, count) => char.repeat(count));

let encodedFrames = str => str.split('').reduce((acc, char) => {
	if (char === '|') {
		return acc + char;
	}
	if (acc.length === 1) {
		acc = acc + '1';
	}
	if (char === acc.replace(/\d*$/, '').slice(-1)) {
		return acc.replace(/\d*$/, oldNumber => Number(oldNumber) + 1);
	}
	return acc + char + '1';
});

// Converts to RLE sheet
for (let i = 0; i < files.length; i++) {
	const transparentKey = '$';
	const file = files[i];
	const fileData = file
		.replaceAll('.png', '')
		.split(',');
	const info = fileData.filter((_, i) => i);
	const frameWidth = Number(info
		.filter(val => val.includes('w'))[0]
		.replace('w', ''));
	const frameHeight = Number(info
		.filter(val => val.includes('h'))[0]
		.replace('h', ''));
	const fpsExtract = info.filter(val => val.includes('s'))[0];
	const fps = fpsExtract ? Number(fpsExtract.replace('s', '')) : 1;

	const img = await Jimp.read(file);
	const nFramesW = Math.floor(img.bitmap.width / frameWidth);
	const nFramesH = Math.floor(img.bitmap.height / frameHeight);
	const nFrames = nFramesW * nFramesH;
	const frames = [];
	const colors = {};
	let num = 64;

	const getImageData = (x=0, y=0) => {
		const rgba = intToRGBA(img.getPixelColor(x, y));
		return rgba;
	};

	// const getImageData = (sx, sy, x, y) => {
	// const data = img.bitmap.data;
	// let r = 0;
	// let g = 0;
	// let b = 0;
	// let a = 0;
	// for (let y = sy; y < img.bitmap.height; y++) {
	// 	for (let x = sx; x < img.bitmap.width; x++) {
	// 		let idx = (img.bitmap.width * py + px) << 2;
	// 		r = data[idx];
	// 		g = data[idx + 1];
	// 		b = data[idx + 2];
	// 		a = data[idx + 3];
	// 	}
	// }
	// return {r, g, b, a};
	// }

	while(frames.length < nFrames) {
		let frame = '';
		let i = frames.length;
		let sx = i % nFramesW * frameWidth;
		let sy = Math.floor(i / nFramesW) * frameHeight;
		while (frame.length < frameWidth * frameHeight) {
			let px = frame.length % frameWidth + sx;
			let py = Math.floor(frame.length / frameWidth) + sy;
			let {r, g, b, a} = getImageData(px, py);
			let color = '';
			if (a === 0) {
				color = 'transparent';
			} else if (a === 255) {
				color = '#' + r.toString(16) + g.toString(16) + b.toString(16);
			} else {
				color = `rgba(${r}, ${g}, ${b}, ${a/255})`;
			}
			let key = transparentKey;
			if (color !== 'transparent') {
				if (Object.keys(colors).map(c => colors[c]).indexOf(color) === -1) {
					while (key === transparentKey) {
						num = num + 1;
						key = String.fromCharCode(num);
						colors[key] = color;
					}
				} else {
					key = Object.keys(colors).reduce((acc, k) => (colors[k] === color) ? k : acc);
				}
			}
			frame = frame + key;
		}
		frames.push(encodedFrames(frame));
	}

	const getFramesObject = {
		w: frameWidth,
		h: frameHeight,
		frames: frames.join('|'),
		palette: colors,
		fps
	};

	const fileName = file
		.replace(imagesDir, '')
		.split('/')
		.filter(val => !val.includes(','))
		.map((val,i) => i ? capitalizeFirstLetter(val) : val)
		.toString()
		.replaceAll(',', '')
		.concat(filePostfix);

	let varName = fileData[0]
		.replace(imagesDir, '')
		.split('/');

	varName = [...new Set(varName)];

	if (varName.length > 1) {
		varName = varName.filter(val => !fileName.includes(val));
	}

	const newVarName = varName
		.toString()
		.replaceAll(',', '_')
		.toUpperCase();

	const txt =`export const ${newVarName} = ${JSON.stringify(getFramesObject, null, 4)}\n\n`;

	outFiles[fileName] = outFiles[fileName] || [];
	outFiles[fileName].push(txt);

	// console.log(txt);
}

// write RLE files
for (let key in outFiles) {
	const fileName = key;
	const txts = outFiles[key];
	const outFile = `${outDir}${fileName}.js`;
	let input = '// Auto generated via cli/images.build.js\n\n';

	txts.forEach(txt => {
		input += txt;
	});

	fs.writeFile(outFile, input, function (err) {
		if (err) return console.log(err);
		console.log(outFile);
	});
}

console.log('Images to RLE sprites build completed!');

function capitalizeFirstLetter(word='') {
	return word.charAt(0).toUpperCase() + word.slice(1);
}
