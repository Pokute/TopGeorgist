const initialState = [];

export default (state = initialState, action) => {
	switch (action.type) {
		case 'TGO_INVENTORY_ADD':
			const existingItem = state.find(ii => ii.typeId === action.item.typeId);
			const existingCount = existingItem ? existingItem.count : 0;
			return [
				...state.filter(ii => ii.typeId !== action.item.typeId),
				{
					...action.item,
					count: action.item.count + existingCount,
				},
			];
		default:
			return state;
	}
};
