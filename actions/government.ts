import { createAction } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo.js';
import { MapPosition } from '../concerns/map.js';

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

export const distribute = createAction('GOVERNMENT_DISTRIBUTE',
	(money: number) => (money)
)();
