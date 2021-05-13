import { put, select, takeEvery, take } from 'redux-saga/effects';
import { getType, ActionType } from 'typesafe-actions';

import * as accountActions from '../actions/account.js';
import isServer from '../isServer.js'
import * as accountsActions from '../actions/accounts.js';
import { set as allSet } from '../actions/allSet.js';
import * as defaultsActions from '../actions/defaults.js';
import * as netActions from '../actions/net.js';
import * as taskQueueActions from '../actions/taskQueue.js';
import * as tgoActions from '../actions/tgo.js';
import * as playerActions from '../actions/player.js';
import { createPlayerAction } from '../data/initialObjects.js';
import { TgoType } from '../reducers/tgo.js';
import combinedReducers from '../reducers.js';
import { setPlayerTgoId } from '../actions/defaults.js';
import { setPosition } from '../components/position.js';
import { hasComponentPlayer } from '../components/player.js';
import { hasComponentLabel } from '../components/label.js';

const handlePlayerCreateRequest = function* ({ payload: { accountId, clientId, label }}: ActionType<typeof playerActions.playerRequestServer>) {
	if (!isServer) return;
	console.log('Received playerCreateRequest ', label);
	const state: ReturnType<typeof combinedReducers> = yield select();
	const hasNameConflict = (Object.values(state.tgos) as ReadonlyArray<TgoType>)
		.some((tgo: TgoType) => (hasComponentPlayer(tgo) && hasComponentLabel(tgo) && (tgo.label === label)));
	if (hasNameConflict) return;

	if (!state.accounts[accountId]) {
		// Account not found.
		return;
	}
	if (state.accounts[accountId].playerTgoId) {
		// Account already has an player.
		return;
	}

	const defaultPlayerAction = createPlayerAction();
	const newPlayerAction = {
		...defaultPlayerAction,
		payload: {
			tgo: {
				...defaultPlayerAction.payload.tgo,
				label: label,
				position: {
					x: Math.trunc(15 * Math.random()),
					y: Math.trunc(15 * Math.random()),
				},
			},
		},
	};
	yield put(newPlayerAction);

	yield put(accountActions.setPlayerTgoId({
		accountId,
		playerTgoId: newPlayerAction.payload.tgo.tgoId,
	}));

	const socket = state.clients[clientId].socket;
	socket.sendAction(allSet({
		...(yield select()),
		clients: {},
	}));

	socket.sendAction(setPlayerTgoId(newPlayerAction.payload.tgo.tgoId));
};

const handleClientPlayerCreate = function* ({ payload: { label }}: ActionType<typeof playerActions.playerRequest>) {
	if (isServer) return; // Client only

	const state: ReturnType<typeof combinedReducers> = yield select();
	let accountId;
	if (!state.defaults.accountId) {
		yield put(netActions.send(accountsActions.accountRequest({
			username: '',
			password: '',
		})));
		const setAccountIdAction: ActionType<typeof defaultsActions.setAccountId> = yield take(getType(defaultsActions.setAccountId));
		accountId = setAccountIdAction.payload.accountId;
	} else {
		accountId = state.defaults.accountId;
	}

	yield put(netActions.send(playerActions.playerRequest({
		accountId,
		label,
	})));
	yield take(getType(defaultsActions.setPlayerTgoId));
};

const playerListener = function* () {
	yield takeEvery(getType(playerActions.playerRequestServer), handlePlayerCreateRequest);
	yield takeEvery(getType(playerActions.clientPlayerCreate), handleClientPlayerCreate);
};

export default playerListener;
