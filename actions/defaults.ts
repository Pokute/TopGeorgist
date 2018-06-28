import { createAction } from 'typesafe-actions';
import { TgoId } from '../reducers/tgo';
import { ViewId } from '../reducers/view';

export const setPlayerTgoId = createAction('DEFAULTS_SET_PLAYER', (resolve) => {
	return (playerTgoId: TgoId) => resolve({
		playerTgoId,
	});
});

export const setViewId = createAction('DEFAULTS_SET_VIEW', (resolve) => {
	return (viewId: ViewId) => resolve({
		viewId,
	});
});
