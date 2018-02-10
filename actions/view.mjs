import store from '../store';
import * as viewUtils from '../utils/view';

export const create = (viewId, followTgoId = undefined) => ({
	type: 'VIEW_ADD',
	view: {
		viewId,
		// canvas: c,
		canvasId: `view-canvas-${viewId}`,
		followTgoId,
		position: { x: 10, y: 10 },
		// size: { x: c.width, y: c.height },
	}
});

export const setFollowTarget = (viewId, tgoId) => ({
	type: 'VIEW_SET_FOLLOW_TARGET',
	viewId,
	tgoId,
});

export const render = (viewId) => ({
	type: 'VIEW_RENDER',
	viewId,
});
