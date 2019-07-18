import { v4 as uuidv4 } from 'uuid';
import { createAction } from 'typesafe-actions';

import { TgosState } from '../reducers/tgos';
import { TgoPartials, TgoId } from '../reducers/tgo';

export const setAll = createAction('TGOS_SET', (resolve) => {
	return (tgos: TgosState) => resolve({
		tgos,
	});
});

export const add = createAction('TGO_ADD', (resolve) => {
	return (tgo: TgoPartials) => resolve({
		tgo: {
			...tgo,
			tgoId: uuidv4() as TgoId,
		},
	});
});

export const remove = createAction('TGO_REMOVE', (resolve) => {
	return (tgoId: TgoId) => resolve({
		tgoId,
	});
});
