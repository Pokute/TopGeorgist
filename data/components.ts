import { Parameter } from '../ui/paramInput.js';
import { TypeId } from '../reducers/itemType.js';

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
}

interface ComponentActionable {
	readonly actions: {
		[actionName: string]: Action,
	}
}

export interface ComponentList {
	readonly [componentName: string]: ComponentActionable,
}

type ComponentWithParams = [
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
};
