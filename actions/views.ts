import { createAction } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo';
import { initialState, ViewId } from '../reducers/view';

export const create = createAction('VIEW_ADD', (resolve) => {
	return (viewId: ViewId, followTgoId?: TgoId) => resolve({
		view: {
			...initialState,
			viewId,
			// canvas: c,
			canvasId: `view-canvas-${viewId}`,
			followTgoId,
			position: { x: 10, y: 10 },
			// size: { x: c.width, y: c.height },
		},
	});
});
