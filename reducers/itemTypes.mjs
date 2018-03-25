const initialState = {};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'ITEMTYPE_ADD':
			if (Object.keys(state).includes(action.itemType.typeId)) {
				console.warn(`Overrided item type ${action.itemType.typeId}`);
			}
			return {
				...state,
				[action.itemType.typeId]: action.itemType,
			};
		default:
			return state;
	}
};
