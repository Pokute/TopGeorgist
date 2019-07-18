import { ActionType, getType } from 'typesafe-actions';
import { takeEvery, select, put } from 'redux-saga/effects';

import * as netActions from '../actions/net';
import { RootStateType } from '../reducers';
import * as accountsActions from '../actions/accounts';
import * as viewActions from '../actions/view';
import * as mapActions from '../actions/map';
import * as tileSetsActions from '../actions/tileSets';
import * as tgoActions from '../actions/tgo';
import * as tgosActions from '../actions/tgos';
import { moveGoal } from '../actions/moveGoal';
import { MapPosition } from '../reducers/map';
import { ViewId } from '../reducers/view';

const netSend = function* (action: ActionType<typeof netActions.send>) {
	const clienToServerSocket = ((yield select()) as RootStateType).serverConnection.websocket;
	if (!clienToServerSocket) {
		return;
	}
	clienToServerSocket.send(JSON.stringify({ action: action.payload.sendAction }));
};

const receiveMessageListener = function* ({payload: { messageData }}: ActionType<typeof netActions.receiveMessage>) {
	if (!messageData || !messageData.action || !messageData.action.type) {
		console.log('Bad message received');
		return;
	}

	const payload = messageData.action.payload;

	yield put(messageData.action);

	switch (messageData.action.type) {
		case 'ALL_SET':
			const newState = payload;
			if (newState.map) yield put(mapActions.set(newState.map));
			if (newState.tileSets) yield put(tileSetsActions.set(newState.tileSets));
			if (newState.tgos) yield put(tgosActions.setAll(newState.tgos));
			if (newState.accounts) yield put(accountsActions.setAll(newState.accounts));
			break;
		case 'DEFAULTS_SET_PLAYER':
			const defaultPlayerTgoId = ((yield select()) as RootStateType).defaults.playerTgoId;
			if (defaultPlayerTgoId) {
				yield put(viewActions.setFollowTarget('main' as ViewId, defaultPlayerTgoId));

				yield put(viewActions.clickActionStack.push('main' as ViewId, moveGoal(
					defaultPlayerTgoId,
					{ x: 0, y: 0 } as MapPosition,
				)))
			}
			break;
		case 'DEFAULTS_SET_ACCOUNT':
			window.localStorage.setItem('AccountToken', messageData.action.payload.token);
			break;
		default:
			console.log(`Unhandled message from server of type: ${messageData.action.type}`)
			break;
	};
};

const netListener = function* () {
	yield takeEvery(getType(netActions.send), netSend);
	yield takeEvery(getType(netActions.receiveMessage), receiveMessageListener);
};

export default netListener;
