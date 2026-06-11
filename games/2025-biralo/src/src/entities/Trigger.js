import { Rectangle } from '@lib/display';

/**
 * @type {FTrigger}
 */
export function Trigger(nodeList, width, height, color) {
	/**
	 * @type {TNodes}
	 */
	let nodes = nodeList;
	/**
	 * @type {boolean[]}
	 */
	let entitiesTriggered = nodes.map(() => false);

	const o = Rectangle(0, 0, width, height, color);

	const self = Object.assign(o, /** @type {TTrigger}*/({
		nodes,
		width,
		height,
		delay: 0,
		register(index) {
			// on each trigger call this function to update the list;
			entitiesTriggered[index] = true;
		},
		isJobDone() {
			return !entitiesTriggered.includes(false);
		},
		kill() {
			self.detach();
		}
	}));

	return self;
}
