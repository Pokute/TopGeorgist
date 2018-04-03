const initialState = {
	viewId: undefined,
	canvas: undefined,
	followTgoId: undefined,
	position: {
		x: 0,
		y: 0,
	},
	size: {
		x: 100,
		y: 100,
	},
	clickActionStack: [],
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'VIEW_SET_POSITION':
			return {
				...state,
				position: action.position,
			};
		case 'VIEW_SET_SIZE':
			return {
				...state,
				view: action.view,
			};
		case 'VIEW_SET_FOLLOW_TARGET':
			return {
				...state,
				followTgoId: action.tgoId,
			};
		case 'VIEW_CLICK_ACTION_STACK_PUSH':
			return {
				...state,
				clickActionStack: [ ...state.clickActionStack, action.action ],
			};
		case 'VIEW_CLICK_ACTION_STACK_POP':
			return {
				...state,
				clickActionStack: state.clickActionStack.slice(0, -1),
			};
		default:
			return state;
	}
};
