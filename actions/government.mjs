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

export const addRentDebt = (tgoId, position, amount) => ({
	type: 'GOVERNMENT_CLAIM_DEBT_ADD',
	tgoId,
	position,
	amount,
});

export const distribute = (money) => ({
	type: 'GOVERNMENT_DISTRIBUTE',
	money,
});

export const rent = (tgoId, position) => ({
	type: 'GOVERNMENT_RENT_LAND',
	tgoId,
	position,
});
