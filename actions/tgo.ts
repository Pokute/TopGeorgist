import { createAction } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo';
import { ComponentPresentation } from '../data/components_new';

interface TgoAction {
	readonly tgoId: TgoId,
};

// const resolveTgoAction = (payload: TgoAction, meta: any) => (resolve: any) => resolve(payload, meta);

export const setColor = createAction('TGO_SET_COLOR', (resolve) => {
	return (tgoId: TgoId, color: ComponentPresentation['presentation']['color']) => resolve({
		tgoId,
		color,
	});
});
