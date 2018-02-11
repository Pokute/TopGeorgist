export const addCitizen = tgoId => ({
	type: 'CITIZEN_ADD',
	tgoId,
});

export const removeCitizen = tgoId => ({
	type: 'CITIZEN_REMOVE',
	tgoId,
});

export const addStipend = (tgoId, amount) => ({
	type: 'GOVERNMENT_STIPEND_ADD',
	tgoId,
	amount,
});

export const addDebt = (tgoId, amount) => ({
	type: 'GOVERNMENT_DEBT_ADD',
	tgoId,
	amount,
});
