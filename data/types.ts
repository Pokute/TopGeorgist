import { add } from '../actions/itemTypes';
import { Dispatch } from '../node_modules/redux';
import { InitialItemType, TypeId } from '../reducers/itemType';

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

const items: InitialItemTypesState = {
	calories: {
		label: 'Calories',
		stackable: true,
		isInteger: false,
	},
	money: {
		label: 'Money',
		stackable: true,
	},
	pineApple: {
		label: 'Pineapple',
		stackable: true,
		isInteger: false,
		components: [
			'consumable',
		],
		inventory: [
			{
				typeId: 'Calories' as TypeId,
				count: 500,
			},
		],
	},
	pineAppleShoot: {
		components: [
			'plantable',
		],
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
	},
	position: {
		label: 'Position',
		isStorable: false,
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

const createItemTypes = (dispatch: Dispatch) => {
	const actions = Object.entries(items)
		.map(([key, val]) => ({ ...val, typeId: key as TypeId }))
		.map(i => ({ ...defaultType, ...i }))
		.map(add);
	actions.forEach(a => dispatch(a));
};

export default createItemTypes;