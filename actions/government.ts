import { createAction } from 'typesafe-actions';

import { type TgoId } from '../reducers/tgo.ts';
import { type MapPosition } from '../concerns/map.ts';

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
