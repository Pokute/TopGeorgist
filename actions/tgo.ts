import { createAction } from 'typesafe-actions';

import { TgoType, TgoId } from '../reducers/tgo';

interface TgoAction {
	tgoId: TgoId,
};

// const resolveTgoAction = (payload: TgoAction, meta: any) => (resolve: any) => resolve(payload, meta);

export const setPosition = createAction('TGO_SET_POSITION', (resolve) => {
	return (tgoId: TgoId, position: TgoType['position']) => resolve({
		tgoId,
		position,
	});
});

export const setMoveTarget = createAction('TGO_SET_MOVE_TARGET', (resolve) => {
	return (tgoId: TgoId, position: TgoType['moveTarget']) => resolve({
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
