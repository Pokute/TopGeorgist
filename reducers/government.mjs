const initialState = {
	citizens: [],
	claims: [],
	rentModulus: 0,
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
		case 'GOVERNMENT_DISTRIBUTE':{
			const totalMoney = (action.money + state.rentModulus);
			const citizenCount = state.citizens.length;
			const moneyPerCitizen = Math.trunc(totalMoney / citizenCount);
			return {
				...state,
				citizens: state.citizens.map(c => ({...c, stipend: c.stipend + moneyPerCitizen})),
				rentModulus: totalMoney - (moneyPerCitizen * citizenCount),
			};
		}
		case 'GOVERNMENT_ADD_RENT_MODULUS':
			return {
				...state,
				rentModulus: state.rentModulus + action.change,
			};
		case 'GOVERNMENT_RENT_LAND':
			return {
				...state,
				claims: [
					...claims,
					actions.claim,
				],
			};
		default:
			return state;
	}
};
