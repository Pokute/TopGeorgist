import { v4 as uuidv4 } from 'uuid';
import { createAction } from 'typesafe-actions';

import { TgosState } from '../reducers/tgos.js';
import { TgoPartials, TgoId } from '../reducers/tgo.js';

export const setAll = createAction('TGOS_SET',
	(tgos: TgosState) => ({
		tgos,
	})
)();

export const add = createAction('TGO_ADD',
	(tgo: TgoPartials) => ({
		tgo: {
			...tgo,
			// tgoId: uuidv4() as TgoId,
			tgoId: tgo.tgoId ?? uuidv4() as TgoId,
		},
	})
)();

export const remove = createAction('TGO_REMOVE',
	(tgoId: TgoId) => ({
		tgoId,
	})
)();
