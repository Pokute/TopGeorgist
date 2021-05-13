import { AnyAction } from 'redux';

import { inventoryActions } from '../components/inventory.js';
import { TgoType, ComponentId } from '../reducers/tgo.js';

import { Parameter } from '../ui/paramInput.js';
import { TypeId } from '../reducers/itemType.js';
import { hasComponentInventory } from '../components/inventory.js';

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
	},
	actorRequirements?: {
		components: Array<string>
	}
}

export interface ComponentTicker {
	readonly tick: (tgo: TgoType, options: any) => ReadonlyArray<AnyAction> | void,
}

// export const hasComponentTicker =  <BaseT extends TgoType | ComponentTicker>(tgo: BaseT) : tgo is (BaseT & Required<ComponentTicker>) =>
// 	tgo && (tgo.tick !== undefined);

export interface ComponentActionable {
	readonly actions: {
		[actionName: string]: Action,
	}
}

export interface ComponentEmpty {
};

type Component = ComponentEmpty | ComponentTicker | ComponentActionable;

export interface ComponentList {
	readonly [componentName: string]: Component,
}

export type ComponentWithParams = [
	string,
	any
];

export type ComponentArray = ReadonlyArray<string | ComponentWithParams>;

const components: {
	[componentName: string]: Partial<ComponentActionable>,
} = {
	consumable: {
		actions: {
			consume: {
				label: 'Eat it',
				onClick: {
					// type: 'CONSUMABLE_CONSUME',
					type: 'TGO_GOAL_CREATE_CONSUME' as TypeId,
				},
				actorRequirements: {
					components: [
						'consumer',
					],
				},
			},
			turnIntoSeeds: {
				label: 'Turn into seeds',
				onClick: {
					type: 'CONSUMABLE_INTO_SEEDS' as TypeId,
				},
			},
		},
	},
	consumer: {

	},
	plantable: {
		actions: {
			consume: {
				label: 'Plant it',
				onClick: {
					type: 'PLANT' as TypeId,
				},
			},
		},
	},
	trader: {
	},
};

export default components;
