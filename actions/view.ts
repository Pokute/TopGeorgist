import { createAction } from 'typesafe-actions';

import { ViewId } from '../reducers/view';

export const setPosition = createAction('VIEW_SET_POSITION', (resolve) => {
	return (viewId: ViewId, position) => resolve({
		viewId,
		position,
	});
});

export const setSize = createAction('VIEW_SET_SIZE', (resolve) => {
	return (viewId: ViewId, size) => resolve({
		viewId,
		size,
	});
});

export const rawClick = createAction('VIEW_RAW_CLICK', (resolve) => {
	return (viewId: ViewId, mapPosition) => resolve({
		viewId,
		mapPosition,
	});
});

export const setFollowTarget = createAction('VIEW_SET_FOLLOW_TARGET', (resolve) => {
	return (viewId: ViewId, tgoId) => resolve({
		viewId,
		tgoId,
	});
});

export const render = createAction('VIEW_RENDER', (resolve) => {
	return (viewId: ViewId) => resolve({
		viewId,
	});
});

export const clickActionStack = {
	push: createAction('VIEW_CLICK_ACTION_STACK_PUSH', (resolve) => {
		return (viewId: ViewId, action: any) => resolve({
			viewId,
			action,
		});
	}),
	pop: createAction('VIEW_CLICK_ACTION_STACK_POP', (resolve) => {
		return (viewId: ViewId) => resolve({
			viewId,
		});
	}),
};
