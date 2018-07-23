import { add } from './actions/itemTypes';
import { Dispatch } from './node_modules/redux';
import { InitialItemType } from './reducers/itemType';

const defaultType = {
	stackable: true,
	isInteger: true,
	positiveOnly: true,
	building: false,
};

export type InitialItemTypesState = {
	[extraProps: string]: InitialItemType;
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
	},
	pineAppleShoot: {
		components: [
			'plantable',
		],
		label: 'Pineapple shoot',
		stackable: true,
		isInteger: true,
		building: true,
		growsIntoTypeId: 'pineApple',
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
};

const createItemTypes = (dispatch: Dispatch) => {
	const actions = Object.entries(items)
		.map(([key, val]) => ({ ...val, typeId: key }))
		.map(i => ({ ...defaultType, ...i }))
		.map(add);
	actions.forEach(a => dispatch(a));
};

export default createItemTypes;
