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
		],
	},
	pineAppleShoot: {
		label: 'Pineapple shoot',
		stackable: true,
		isInteger: true,
		building: true,
		growsIntoTypeId: 'pineApple' as TypeId,
	},
	player: {
		label: 'Player',
		stackable: false,
	},
	building: {
		label: 'Building',
		stackable: false,
		building: true,
	},
	plant: {
		label: 'Plant',
		stackable: false,
		isInteger: true,
		building: true,
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
	}
};

export const createItemTypeAction = (typeId: string, item: InitialItemType) =>
	add({ ...defaultType, typeId: typeId as TypeId, ...item });

const createItemTypes = (dispatch: Dispatch) => {
	const actions = Object.entries(items)
		.map(([key, val]) => createItemTypeAction(key, val));
	actions.forEach(a => dispatch(a));
};

export default createItemTypes;
