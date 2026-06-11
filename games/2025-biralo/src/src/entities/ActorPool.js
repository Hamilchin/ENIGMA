import { Frog } from './Frog';
import { Player } from './Player';
import { Totem } from './Totem';

/**
 * @type {FActorPool}
 */
export function ActorPool() {
	/**
	 * @type {TPlayer}
	 */
	let player;
	/**
	 * @type {TFrog}
	 */
	let frog;

	/**
	 * @type {{[name:string]: TTotemPoolStorage}}
	 */
	let totems = {};

	/**
	 * @type {TActorPool}
	 */
	const self = {
		init() {
			initPlayer();
			initTotems();
			initFrog();
		},
		getPlayer() {
			return player;
		},
		getTotem() {
			const pool = totems['totem'].pool;
			let extractedTotem = null;

			for (let i=0; i<pool.length; i++) {
				const totem = pool[i];
				if (!totem.active) {
					extractedTotem = totem;
					break;
				}
			}

			return extractedTotem;
		},
		getFrog() {
			return frog;
		},
		detach() {
			player.detach();
			player.reset();
			detachTotems();
			frog.detach();
			frog.reset();
		}
	};

	self.init();

	function initPlayer() {
		player = Player('player', 8, 8);
	}

	function initTotems() {
		addToBasket('totem', {max:4, pool:[]});

		for (let name in totems) {
			const props = totems[name];
			const max = props.max;
			const pool = props.pool;

			for (let i = 0; i < max; i++) {
				const id = `${name}_${i}`; 
				const totem = Totem(id, 8, 8);
				pool.push(totem);
			}
		}
	}

	function initFrog() {
		frog = Frog('frog', 8, 8);
	}

	function detachTotems() {
		for (let name in totems) {
			const props = totems[name];
			const pool = props.pool;

			pool.forEach(totem => {
				totem.detach();
				totem.reset();
			});
		}
	}

	/**
	 * @param {string} name
	 * @param {TTotemPoolStorage} data
	 */
	function addToBasket(name, data) {
		totems[name] = data;
	}

	return self;
}
