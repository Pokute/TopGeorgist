import { createAction } from 'typesafe-actions';

import { type TgoId } from '../reducers/tgo.ts';
import { initialState, type ViewId } from '../reducers/view.ts';
import { type MapPosition } from '../concerns/map.ts';

export const create = createAction('VIEW_ADD',
	(viewId: ViewId, followTgoId?: TgoId) => ({
		view: {
			...initialState,
			viewId,
			// canvas: c,
			canvasId: `view-canvas-${viewId}`,
			followTgoId,
			position: { x: 10, y: 10 } as MapPosition,
			// size: { x: c.width, y: c.height },
		},
	})
)();
