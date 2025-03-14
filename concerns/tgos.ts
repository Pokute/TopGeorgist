import { v4 as uuidv4 } from 'uuid';
import { createAction } from 'typesafe-actions';

import { RootStateType } from '../reducers/index.js';
import { TgoId, TgoPartials, TgoType } from '../reducers/tgo.js';
import { TgosState } from '../reducers/tgos.js';

export const selectTgo = (state: RootStateType, tgoId: TgoId) =>
	state.tgos[tgoId];

// Using this like allows to use type guarding funcs like hasComponentInventory for arrays of tuples.
// Example: Object.entries(tgos).filter(createTupleFilter(hasComponentInventory))
export const createTupleFilter = <DerivedT extends BaseT, BaseT extends TgoType>(filterFunc: (tgo?: BaseT) => tgo is DerivedT) => (tgoTuple: [tgoId: string, tgoz?: BaseT]) : tgoTuple is [string, (BaseT & Required<DerivedT>)] =>
	filterFunc(tgoTuple[1]);

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

export const tgosActions = {
	setAll,
	add,
	remove,
};
