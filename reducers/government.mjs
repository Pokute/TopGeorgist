const initialState = {
	citizens: [],
};

const initialCitizenState = {
	stipend: 50,
	rentDebt: 0,
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'CITIZEN_ADD':
			return {
				...state,
				citizens: [
					...state.citizens,
					{
						...initialCitizenState,
						tgoId: action.tgoId,
					}
				],
			};
		case 'CITIZEN_REMOVE':
			return {
				...state,
				citizens: state.citizens.filter(tgo => tgo.tgoId !== action.tgoId)
			};
		default:
			return state;
	}
};
