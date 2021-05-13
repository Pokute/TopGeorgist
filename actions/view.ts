import { createAction } from 'typesafe-actions';
import { ViewId } from '../reducers/view.js';
import { MapPosition, MapSize } from '../reducers/map.js';
import { TgoId } from '../reducers/tgo.js';

export const setPosition = createAction('VIEW_SET_POSITION',
	(viewId: ViewId, position: MapPosition) => ({
		viewId,
		position,
	})
)();

export const setSize = createAction('VIEW_SET_SIZE',
	(viewId: ViewId, size: MapSize) => ({
		viewId,
		size,
	})
)();

export const rawClick = createAction('VIEW_RAW_CLICK',
	(viewId: ViewId, mapPosition: MapPosition) => ({
		viewId,
		mapPosition,
	})
)();

export const setFollowTarget = createAction('VIEW_SET_FOLLOW_TARGET',
	(viewId: ViewId, tgoId: TgoId) => ({
		viewId,
		tgoId,
	})
)();

export const render = createAction('VIEW_RENDER',
	(viewId?: ViewId) => ({
		viewId,
	})
)();

export const clickActionStack = {
	push: createAction('VIEW_CLICK_ACTION_STACK_PUSH',
		(viewId: ViewId, action: any) => ({
			viewId,
			action,
		})
	)(),
	pop: createAction('VIEW_CLICK_ACTION_STACK_POP',
		() => ({})
	)(),
};
