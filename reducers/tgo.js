import inventoryReducer from './inventory';

const initialState = {
	tgoId: undefined,
	position: {
		x: 0,
		y: 0,
	},
	color: 'red',
	renderer: undefined,
}

export default (state = initialState, action) => {
	switch (action.type) {
		case 'TGO_SET_POSITION':
			return {
				...state,
				position: action.position,
			};
		case 'TGO_SET_COLOR':
			return {
				...state,
				color: action.color,
			};
		case 'TGO_INVENTORY_ADD':
			return {
				...state,
				inventory: inventoryReducer(state.inventory, action),
			};
		default:
			return state;
	}
};
