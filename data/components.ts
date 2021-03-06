import { AnyAction } from 'redux';

import { inventoryActions } from '../components/inventory';
import { TgoType } from '../reducers/tgo';

import { Parameter } from '../ui/paramInput';
import { TypeId } from '../reducers/itemType';
import { hasComponentInventory } from '../components/inventory';

export interface Action {
	readonly label: string,
	readonly parameters?: ReadonlyArray<Parameter>,
	readonly onClick: {
		readonly type: string,
		readonly items?: ReadonlyArray<{
			readonly typeId: TypeId,
			readonly count: number,
		}>,
		readonly [extra: string]: any,
	}
}

export interface ComponentTicker {
	readonly tick: (tgo: TgoType, options: any) => ReadonlyArray<AnyAction> | void,
}

export interface ComponentActionable {
	readonly actions: Array<Action>,
}

export interface ComponentEmpty {
};

type Component = ComponentEmpty | ComponentTicker | ComponentActionable;

export interface ComponentList {
	readonly [componentName: string]: Component,
}

type ComponentWithParams = [
	string,
	any
];

export type ComponentArray = ReadonlyArray<string | ComponentWithParams>;

const components: ComponentList = {
	inventoryChange: {
		tick: (tgo: TgoType, options = { typeId: 'calories', perTick: -1 }) => {
			const actions = [];
			if (hasComponentInventory(tgo)) {
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
