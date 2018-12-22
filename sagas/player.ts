import { put, select, takeEvery, take } from 'redux-saga/effects';
import { getType, ActionType } from 'typesafe-actions';

import * as accountActions from '../actions/account';
import * as accountsActions from '../actions/accounts';
import { set as allSet } from '../actions/allSet';
import * as defaultsActions from '../actions/defaults';
import * as netActions from '../actions/net';
import * as taskQueueActions from '../actions/taskQueue';
import * as tgoActions from '../actions/tgo';
import * as playerActions from '../actions/player';
import { createPlayerAction } from '../initialObjects';
import { TgoType } from '../reducers/tgo';
import topGeorgist from '../reducers';
import { setPlayerTgoId } from '../actions/defaults';
import { setPosition } from '../actions/tgo';

const handlePlayerCreateRequest = function* ({ payload: { accountId, clientId, label }}: ActionType<typeof playerActions.playerRequestServer>) {
	if (!global.isServer) return;
	console.log('Received playerCreateRequest ', label);
	const state: ReturnType<typeof topGeorgist> = yield select();
	const hasNameConflict = Object.values(state.tgos)
		.some((tgo: TgoType) => (tgo.typeId === 'player') && (tgo.label === label));
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
	if (global.isServer) return; // Client only

	const state: ReturnType<typeof topGeorgist> = yield select();
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

// const handlePlayerCreateResponse = function* (action) {
// 	if (global.isServer) return;
// 	yield put(setPlayerTgoId(action.playerTgoId));
// };

const handlePlayerSetMoveTarget = function* ({ payload: { tgoId, position} }: ActionType<typeof tgoActions.setMoveTarget>) {
	const tgo: TgoType = (yield select()).tgos[tgoId];
	if (!tgo) return false;
	console.log('starting moving towards ', position.x, ',', position.y);
	yield put(taskQueueActions.addTaskQueue(
		tgoId,
		[{
			title: `Moving to (${position.x}, ${position.y})`,
			advanceActions: [
				{
					type: 'PLAYER_MOVE_TOWARDS',
					tgoId,
				},
			],
		}],
	));
	return true;
};

const handlePlayerMoveTowards = function* ({ tgoId }: any) {
	const tgo = (yield select()).tgos[tgoId];
	if (!tgo) return false;
	yield put(setPosition(tgo.tgoId,
		{
			x: tgo.position.x + Math.sign(tgo.moveTarget.x - tgo.position.x),
			y: tgo.position.y + Math.sign(tgo.moveTarget.y - tgo.position.y),
		},
	));
	return true;
};

const playerListener = function* () {
	yield takeEvery(getType(playerActions.playerRequestServer), handlePlayerCreateRequest);
	yield takeEvery(getType(playerActions.clientPlayerCreate), handleClientPlayerCreate);
	// yield takeEvery('PLAYER_CREATE_RESPONSE', handlePlayerCreateResponse);
	yield takeEvery(getType(tgoActions.setMoveTarget), handlePlayerSetMoveTarget);
	yield takeEvery('PLAYER_MOVE_TOWARDS', handlePlayerMoveTowards);
};

export default playerListener;
