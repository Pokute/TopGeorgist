import { createAction } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo';

export const addCitizen = createAction('CITIZEN_ADD', (resolve) => {
	return (tgoId: TgoId) => resolve(tgoId);
});

export const removeCitizen = createAction('CITIZEN_REMOVE', (resolve) => {
	return (tgoId: TgoId) => resolve(tgoId);
});

export const addStipend = createAction('GOVERNMENT_STIPEND_ADD', (resolve) => {
	return (tgoId: TgoId, amount: number) => resolve({
		tgoId,
		amount,
	});
});

export const addDebt = createAction('GOVERNMENT_DEBT_ADD', (resolve) => {
	return (tgoId: TgoId, amount: number) => resolve({
		tgoId,
		amount,
	});
});

export const addRentDebt = createAction('GOVERNMENT_CLAIM_DEBT_ADD', (resolve) => {
	return (tgoId: TgoId, position: {x: number, y: number}, amount: number) => resolve({
		tgoId,
		position,
		amount,
	});
});

export const distribute = createAction('GOVERNMENT_DISTRIBUTE', (resolve) => {
	return (money: number) => resolve(money);
});

export const addRentModulus = createAction('GOVERNMENT_ADD_RENT_MODULUS', (resolve) => {
	return (money: number) => resolve(money);
});

export const rent = createAction('GOVERNMENT_RENT_LAND', (resolve) => {
	return (tgoId: TgoId, position: {x: number, y: number}) => resolve({
		tgoId,
		position,
	});
});
