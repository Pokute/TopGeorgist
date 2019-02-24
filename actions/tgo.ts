import { createAction } from 'typesafe-actions';

import { TgoType, TgoId, TgoInitialTypes } from '../reducers/tgo';
import { ComponentPosition, ComponentMoveTarget } from '../components_new';

interface TgoAction {
	tgoId: TgoId,
};

// const resolveTgoAction = (payload: TgoAction, meta: any) => (resolve: any) => resolve(payload, meta);

export const setPosition = createAction('TGO_SET_POSITION', (resolve) => {
	return (tgoId: TgoId, position: ComponentPosition['position']) => resolve({
		tgoId,
		position,
	});
});

export const setMoveTarget = createAction('TGO_SET_MOVE_TARGET', (resolve) => {
	return (tgoId: TgoId, position: ComponentMoveTarget['moveTarget']) => resolve({
		tgoId,
		position,
	});
});

export const setColor = createAction('TGO_SET_COLOR', (resolve) => {
	return (tgoId: TgoId, color: TgoInitialTypes['color']) => resolve({
		tgoId,
		color,
	});
});
