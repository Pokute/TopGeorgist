import { v4 as uuidv4 } from 'uuid';
import { createAction } from 'typesafe-actions';

import { TgoType, TgoInitialType, TgoId } from '../reducers/tgo';
import { TgosState } from '../reducers/tgos';

interface TgoWithoutId extends TgoInitialType {
	tgoId: never,
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

export const setPosition = createAction('TGO_SET_POSITION', (resolve) => {
	return (tgoId: TgoId, position: TgoType['position']) => resolve({
		tgoId,
		position,
	});
});

export const setColor = createAction('TGO_SET_COLOR', (resolve) => {
	return (tgoId: TgoId, color: TgoType['color']) => resolve({
		tgoId,
		color,
	});
});
