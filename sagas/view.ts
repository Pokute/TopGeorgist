import { put, select, takeEvery } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import * as viewActions from '../actions/view';

const handleViewRawClick = function* ({ payload: { mapPosition, viewId }}: ActionType<typeof viewActions.rawClick>) {
	const s = yield select();
	const view = s.views[viewId];
	if (!view) return false;

	if (!Array.isArray(view.clickActionStack) || (view.clickActionStack.length === 0)) return false;
	const topAction = view.clickActionStack[view.clickActionStack.length - 1];

	yield put({
		...topAction,
		position: mapPosition,
		viewId,
	});

	if (topAction.popOnClick) {
		yield put(viewActions.clickActionStack.pop());
	}

	return true;
};

const viewListener = function* () {
	yield takeEvery(getType(viewActions.rawClick), handleViewRawClick);
};

export default viewListener;
