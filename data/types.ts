import { type Dispatch } from 'redux';
import { add } from '../actions/itemTypes.ts';

import { defaultItemType, type InitialItemType, type TypeId } from '../reducers/itemType.ts';
import { type PrefabId } from '#tg/concerns/prefab.ts';

export type InitialItemTypesState = {
	readonly [extraProps: string]: InitialItemType;
};

export const items: InitialItemTypesState = {
	calories: {
		label: 'calories',
		isInteger: false,
	},
	hydrocarbons: {
		label: 'hydrocarbons',
		isInteger: false,
	},
	money: {
		label: 'Money',
		isInteger: false,
	},
	pineApple: {
		label: 'Pineapple',
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
		deployable: {
			deployPrefabId: 'pineapplePlant' as PrefabId,
			deployVerb: 'Plant',
		},
	},
	growthPotential: {
		label: 'Growth potential',
		isInteger: false,
		collectable: false,
	},
	treeSapling: {
		label: 'Tree sapling',
		deployable: {
			deployPrefabId: 'basicTree' as PrefabId,
			deployVerb: 'Plant',
		},
	},
	wood: {
		label: 'Wood',
	},
	cannery: {
		label: 'Manual cannery',
		deployable: {
			deployPrefabId: 'canneryTool' as PrefabId,
			deployVerb: 'Set up',
		},
	},
	canBlank: {
		label: 'Can blank',
	},
	canUsed: {
		label: 'Can (empty, used)',
	},
	cannedPineApple: {
		label: 'Canned pineapple',
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
	add({ ...defaultItemType, typeId: typeId as TypeId, ...item });

const createItemTypes = (dispatch: Dispatch) => {
	const actions = Object.entries(items)
		.map(([key, val]) => createItemTypeAction(key, val));
	actions.forEach(a => dispatch(a));
};

export default createItemTypes;
