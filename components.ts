import * as inventoryActions from './actions/inventory';
import { TgoType } from './reducers/tgo';
import { AnyAction } from 'redux';

import { Parameter } from './ui/paramInput';
import { TypeId } from './reducers/itemType';

export interface Action {
	label: string,
	parameters?: Parameter[],
	onClick: {
		type: string,
		items?: Array<{
			typeId: TypeId,
			count: number,
		}>,
	}
}

export interface ComponentTicker {
	tick: (tgo: TgoType, options: any) => AnyAction[] | void,
}

export interface ComponentActionable {
	actions: Array<Action>,
}

export interface ComponentEmpty {
};

type Component = ComponentEmpty | ComponentTicker | ComponentActionable;

export interface ComponentList {
	[componentName: string]: Component,
}

type ComponentWithParams = [
	string,
	any
];

export type ComponentArray = ReadonlyArray<string | ComponentWithParams>;

const components: ComponentList = {
	selfMoving: {
		// tick: (tgo) => {
		// 	const actions = [];
		// 	if (tgo.moveTarget) {
		// 		if ((tgo.moveTarget.x === tgo.position.x) &&
		// 			(tgo.moveTarget.y === tgo.position.y)) {
		// 			actions.push({
		// 				type: 'PLAYER_SET_MOVE_TARGET',
		// 				tgoId: tgo.tgoId,
		// 				moveTarget: undefined,
		// 			});
		// 		} else {
		// 			if (!tgo.inventory) return [];

		// 			const cals = tgo.inventory.find(ii => ii.typeId === 'calories');
		// 			if (cals && cals.count > 0) {
		// 				actions.push({
		// 					type: 'TGO_SET_POSITION',
		// 					tgoId: tgo.tgoId,
		// 					position: {
		// 						x: tgo.position.x + Math.sign(tgo.moveTarget.x - tgo.position.x),
		// 						y: tgo.position.y + Math.sign(tgo.moveTarget.y - tgo.position.y),
		// 					},
		// 				});
		// 				actions.push(inventoryActions.add(tgo.tgoId, 'calories', -10));
		// 			}
		// 		}
		// 	}
		// 	return actions;
		// },
	},
	inventoryChange: {
		tick: (tgo: TgoType, options = { typeId: 'calories', perTick: -1 }) => {
			const actions = [];
			if (tgo.inventory) {
				// const cals = tgo.inventory.find(ii => ii.typeId === options.typeId);
				// if (cals && cals.count > 0) {
				actions.push(inventoryActions.add(tgo.tgoId, options.typeId, options.perTick));
				// }
			}
			return actions;
		},
	},
	consumable: {
		actions: [
			{
				consume: {
					label: 'Eat it',
					onClick: {
						type: 'CONSUMABLE_CONSUME',
					},
					actorRequirements: {
						components: [
							'consumer',
						],
					},
				},
			},
			{
				turnIntoSeeds: {
					label: 'Turn into seeds',
					onClick: {
						type: 'CONSUMABLE_INTO_SEEDS',
					},
				},
			},
		],
	},
	consumer: {

	},
	plantable: {
		actions: [
			{
				consume: {
					label: 'Plant it',
					onClick: {
						type: 'PLANT',
					},
				},
			},
		],
	},
	trader: {
	},
};

export default components;
