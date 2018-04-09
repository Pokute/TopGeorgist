import { takeEvery } from 'redux-saga/effects';

const netSend = function* (action) {
	// const sSocket = yield select().server.socket;
	const sSocket = global.ws;
	sSocket.send(JSON.stringify({ action: action.sendAction }));
};

const netListener = function* () {
	yield takeEvery('NET_SEND', netSend);
};

export default netListener;
