import { call, fork, put } from 'redux-saga/effects';

import isServer from '../isServer'
import * as frameActions from '../actions/frame';

const reqWinFrame = () => new Promise(resolve => window.requestAnimationFrame(resolve));

const frameLoop = function* () {
	while (true) {
		yield call(reqWinFrame);
		yield put(frameActions.frame());
	}
};

const frameRootSaga = function* () {
	if (isServer) return;
	yield fork(frameLoop);
};

export default frameRootSaga;
