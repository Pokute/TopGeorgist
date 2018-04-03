import { put, select, takeEvery } from 'redux-saga/effects';
import * as viewActions from '../actions/view';

const handleViewRawClick = function* ({ mapPosition, viewId }) {
	const s = yield select();
	const view = s.views[viewId];
	if (!view) return false;

	if (!Array.isArray(view.clickActionStack) || (view.clickActionStack.length === 0)) return false;
	const topAction = view.clickActionStack[view.clickActionStack.length - 1];

	yield put({
		...topAction,
		mapPosition,
		viewId,
	});

	if (topAction.popOnClick) {
		yield put(viewActions.clickActionStack.pop());
	}

	return true;
};

const viewListener = function* () {
	yield takeEvery('VIEW_RAW_CLICK', handleViewRawClick);
};

export default viewListener;
