const initialState = [];

export default (state = initialState, action) => {
	switch (action.type) {
		case 'ITEMTYPE_ADD':
			return [
				...state,
				action.itemType,
			];
		default:
			return state;
	}
};
