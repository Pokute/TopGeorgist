const initialState = {
	citizens: [],
	claims: [],
	rentModulus: 0,
};

const initialCitizenState = {
	stipend: 50,
};

const initialClaimState = {
	tgoId: undefined,
	position: undefined,
	rentDebt: 0,
};

const rentPerTick = 0.5;

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
					{
						...initialClaimState,
						tgoId: action.tgoId,
						position: action.position,
					}
				],
			};
		case 'GOVERNMENT_STIPEND_ADD':
			const citizen = state.citizens.find(c => c.tgoId === action.tgoId);
			return {
				...state,
				citizens: [
					...state.citizens.filter(c => c !== citizen),
					{
						...citizen,
						stipend: citizen.stipend + action.amount,
					}
				]
			}
		case 'TICK':
			return {
				...state,
				claims: claims.map(c => ({
					...c,
					rentDebt: c.rentDebt + rentPerTick,
				})),
			}
		default:
			return state;
	}
};
