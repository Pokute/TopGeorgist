import { Dispatch } from 'redux';
import { add } from '../actions/itemTypes.js';
import { InitialItemType, TypeId } from '../reducers/itemType.js';

const defaultType = {
	stackable: true,
	isInteger: true,
	positiveOnly: true,
	building: false,
	isStorable: true,
	redeemable: true,
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
			deploysIntoTypeId: 'pineApple' as TypeId,
			deployVerb: 'plant',
			collectVerb: 'harvest',
			deployCount: 0.25,
		},
	},
	cannery: {
		label: 'Manual cannery',
		stackable: true,
		isInteger: true,
		building: true,
		deployable: {},
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
		stackable: true,
		isInteger: true,
		inventory: [
			{
				typeId: 'hydrocarbons' as TypeId,
				count: 400,
			},
			{
				typeId: 'pineAppleShoot' as TypeId,
				count: 1,
			},
			{
				typeId: 'canUsed' as TypeId,
				count: 1,
			},
		],
	},
	canningWork: {
		label: 'Canning work',
		isStorable: false,
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
	},
	movementAmount: {
		label: 'MovementAmount',
		isStorable: true, // For now since we process it in a separate step.
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
		isStorable: false,
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
