import { createAction } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo';
import { initialState, ViewId } from '../reducers/view';
import { MapPosition } from '../reducers/map';

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
