import { type Dispatch } from 'redux';
import { add } from '../actions/itemTypes.ts';

import { type InitialItemType, type OptionalFields, type RequiredFields, type TypeId } from '../reducers/itemType.ts';
import { type ComponentWorkDoer } from '../concerns/work.ts';
import { growPineapple, provideCanneryTool } from './recipes.ts';
import { type ComponentGoalDoer } from '../concerns/goal.ts';

const defaultType: Omit<RequiredFields & OptionalFields, 'typeId'> = {
	stackable: true,
	isInteger: true,
	positiveOnly: true,
	building: false,
	isStorable: true,
	redeemable: true,
	collectable: true,
};

export type InitialItemTypesState = {
	readonly [extraProps: string]: InitialItemType;
};

export const items: InitialItemTypesState = {
	calories: {
		label: 'calories',
		stackable: true,
		isInteger: false,
	},
	hydrocarbons: {
		label: 'hydrocarbons',
		stackable: true,
		isInteger: false,
	},
	money: {
		label: 'Money',
		stackable: true,
		positiveOnly: true,
	},
	pineApple: {
		label: 'Pineapple',
		stackable: true,
		isInteger: false,
		inventory: [
			{
				typeId: 'hydrocarbons' as TypeId,
				count: 500,
			},
			{
				typeId: 'pineAppleShoot' as TypeId,
				count: 1,
			},
		],
	},
	pineAppleShoot: {
		label: 'Pineapple shoot',
		stackable: true,
		isInteger: true,
		building: true,
		deployable: {
			deployInventory: [
				{ typeId: 'pineApple' as TypeId, count: 1/8, },
				{ typeId: 'growthPotential' as TypeId, count: 3-(1/8), },
			],
			deployAdditionals: {
				recipeInfos: [{
					recipe: growPineapple, autoRun: 'OnInputs',
				},],
				worksIssued: [],
			} as Omit<ComponentWorkDoer, 'tgoId'>,
			deployVerb: 'plant',
			collectVerb: 'harvest',
		},
	},
	growthPotential: {
		label: 'Growth potential',
		stackable: true,
		isInteger: false,
		collectable: false,
	},
	cannery: {
		label: 'Manual cannery',
		stackable: true,
		isInteger: true,
		building: true,
		deployable: {
			deployInventory: [
				{ typeId: 'cannery' as TypeId, count: 1, },
			],
			deployAdditionals: {
				recipeInfos: [{
					recipe: provideCanneryTool, autoRun: 'OnDemand',
				},],
				worksIssued: [],
				activeGoals: [],
			} as Omit<ComponentWorkDoer & ComponentGoalDoer, 'tgoId'>,
		},
		// Should be providing canneryWork or a possibility to do it.
	},
	canBlank: {
		label: 'Can blank',
		stackable: true,
		isInteger: true,
	},
	canUsed: {
		label: 'Can (empty, used)',
		stackable: true,
		isInteger: true,
	},
	cannedPineApple: {
		label: 'Canned pineapple',
		isStorable: true,
		stackable: true,
		isInteger: true,
		inventory: [
			{
				typeId: 'hydrocarbons' as TypeId,
				count: 400,
			},
			{
				typeId: 'canUsed' as TypeId,
				count: 1,
			},
		],
	},
	canningWork: {
		label: 'Canning work',
		isStorable: true,// false,
		positiveOnly: false,
	},
	canneryTool: {
		label: 'Cannery tool',
		positiveOnly: false,
	},
	player: {
		label: 'Player',
		stackable: false,
	},
	tick: {
		label: 'Tick',
		isStorable: false,
		positiveOnly: false,
		redeemable: false,
	},
	movementAmount: {
		label: 'MovementAmount',
		isStorable: false,
		redeemable: false,
	},
	work: {
		label: 'Work',
		stackable: false,
		isTgoId: true,
	},
	tgoId: {
		label: 'TgoId',
		stackable: false,
		isTgoId: true,
	},
	calculation: {
		label: 'Calculation',
		isStorable: false,
		positiveOnly: true,
		redeemable: false,
	},
	trade: {
		label: 'Trade',
		isStorable: true,// false,
		positiveOnly: true,
		redeemable: false,
	},
};

export const createItemTypeAction = (typeId: string, item: InitialItemType) =>
	add({ ...defaultType, typeId: typeId as TypeId, ...item });

const createItemTypes = (dispatch: Dispatch) => {
	const actions = Object.entries(items)
		.map(([key, val]) => createItemTypeAction(key, val));
	actions.forEach(a => dispatch(a));
};

export default createItemTypes;
