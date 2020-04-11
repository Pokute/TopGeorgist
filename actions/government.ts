import { createAction } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo';
import { MapPosition } from '../reducers/map';

export const addCitizen = createAction('CITIZEN_ADD',
	(tgoId: TgoId) => (tgoId)
)();

export const removeCitizen = createAction('CITIZEN_REMOVE',
	(tgoId: TgoId) => (tgoId)
)();

export const addStipend = createAction('GOVERNMENT_STIPEND_ADD',
	(tgoId: TgoId, amount: number) => ({
		tgoId,
		amount,
	})
)();

export const addDebt = createAction('GOVERNMENT_DEBT_ADD',
	(tgoId: TgoId, amount: number) => ({
		tgoId,
		amount,
	})
)();

export const addRentDebt = createAction('GOVERNMENT_CLAIM_DEBT_ADD',
	(tgoId: TgoId, position: MapPosition, amount: number) => ({
		tgoId,
		position,
		amount,
	})
)();

export const distribute = createAction('GOVERNMENT_DISTRIBUTE',
	(money: number) => (money)
)();

export const addRentModulus = createAction('GOVERNMENT_ADD_RENT_MODULUS',
	(money: number) => (money)
)();

export const rent = createAction('GOVERNMENT_RENT_LAND',
	(tgoId: TgoId, position: MapPosition) => ({
		tgoId,
		position,
	})
)();
