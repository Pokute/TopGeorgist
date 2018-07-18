import { v4 as uuidv4 } from 'uuid';
import { createAction } from 'typesafe-actions';

import { TgosState } from '../reducers/tgos';
import { TgoInitialType, TgoId } from '../reducers/tgo';

interface TgoWithoutId extends TgoInitialType {
};

export const setAll = createAction('TGOS_SET', (resolve) => {
	return (tgos: TgosState) => resolve({
		tgos,
	});
});

export const add = createAction('TGO_ADD', (resolve) => {
	return (tgo: TgoWithoutId) => resolve({
		tgo: {
			...tgo,
			tgoId: uuidv4(),
		},
	});
});

export const remove = createAction('TGO_REMOVE', (resolve) => {
	return (tgoId: TgoId) => resolve({
		tgoId,
	});
});
