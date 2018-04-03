export const create = (viewId, followTgoId = undefined) => ({
	type: 'VIEW_ADD',
	view: {
		viewId,
		// canvas: c,
		canvasId: `view-canvas-${viewId}`,
		followTgoId,
		position: { x: 10, y: 10 },
		// size: { x: c.width, y: c.height },
	},
});

export const rawClick = (viewId, mapPosition) => ({
	type: 'VIEW_RAW_CLICK',
	mapPosition,
	viewId,
});

export const setFollowTarget = (viewId, tgoId) => ({
	type: 'VIEW_SET_FOLLOW_TARGET',
	viewId,
	tgoId,
});

export const render = viewId => ({
	type: 'VIEW_RENDER',
	viewId,
});

export const clickActionStack = {
	push: action => ({
		type: 'VIEW_CLICK_ACTION_STACK_PUSH',
		action,
	}),
	pop: () => ({
		type: 'VIEW_CLICK_ACTION_STACK_POP',
	}),
};
