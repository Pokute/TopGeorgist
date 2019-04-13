import { createAction } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo';
import { ComponentPosition, ComponentPresentation } from '../components_new';

interface TgoAction {
	readonly tgoId: TgoId,
};

// const resolveTgoAction = (payload: TgoAction, meta: any) => (resolve: any) => resolve(payload, meta);

export const setPosition = createAction('TGO_SET_POSITION', (resolve) => {
	return (tgoId: TgoId, position: ComponentPosition['position']) => resolve({
		tgoId,
		position,
	});
});

export const setColor = createAction('TGO_SET_COLOR', (resolve) => {
	return (tgoId: TgoId, color: ComponentPresentation['presentation']['color']) => resolve({
		tgoId,
		color,
	});
});
