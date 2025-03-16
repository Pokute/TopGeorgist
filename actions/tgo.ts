import { createAction } from 'typesafe-actions';

import { type TgoId } from '../reducers/tgo.ts';
import { type ComponentPresentation } from '../data/components_new.ts';

interface TgoAction {
	readonly tgoId: TgoId,
};

// const resolveTgoAction = (payload: TgoAction, meta: any) => (resolve: any) => resolve(payload, meta);

export const setColor = createAction('TGO_SET_COLOR',
	(tgoId: TgoId, color: ComponentPresentation['presentation']['color']) => ({
		tgoId,
		color,
	})
)();
