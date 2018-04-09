import { put, select, takeEvery } from 'redux-saga/effects';
import * as taskQueueActions from '../actions/taskQueue';
import { createPlayerAction } from '../initialObjects';

const handlePlayerCreateRequest = function* (action) {
	if (!global.isServer) return;
	console.log('Received playerCreateRequest ', action.label);
	const hasNameConflict = Object.values(yield select(state => state.tgos))
		.some(tgo => (tgo.typeId === 'player') && (tgo.label === action.label));
	if (hasNameConflict) return;

	const defaultPlayerAction = createPlayerAction();
	const newPlayerAction = {
		...defaultPlayerAction,
		tgo: {
			...defaultPlayerAction.tgo,
			label: action.label,
			position: {
				x: Math.trunc(15 * Math.random()),
				y: Math.trunc(15 * Math.random()),
			},
		},
	};
	yield put(newPlayerAction);

	const socket = yield select(state => state.clients[action.clientId].socket);
	socket.send(JSON.stringify({
		action: {
			type: 'ALL_SET',
			data: { ...(yield select()), clients: {} },
		},
	}));
	socket.send(JSON.stringify({
		action: {
			type: 'DEFAULTS_SET_PLAYER',
			playerTgoId: newPlayerAction.tgo.tgoId,
		},
	}));
};

const handlePlayerCreateResponse = function* (action) {
	if (global.isServer) return;
	yield put({
		type: 'DEFAULTS_SET_PLAYER',
		playerTgoId: action.playerTgoId,
	});
};

const handlePlayerSetMoveTarget = function* ({ tgoId, position }) {
	const tgo = (yield select()).tgos[tgoId];
	if (!tgo) return false;
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

const handlePlayerMoveTowards = function* ({ tgoId }) {
	const tgo = (yield select()).tgos[tgoId];
	if (!tgo) return false;
	yield put({
		type: 'TGO_SET_POSITION',
		tgoId: tgo.tgoId,
		position: {
			x: tgo.position.x + Math.sign(tgo.moveTarget.x - tgo.position.x),
			y: tgo.position.y + Math.sign(tgo.moveTarget.y - tgo.position.y),
		},
	});
	return true;
};

const playerListener = function* () {
	yield takeEvery('PLAYER_CREATE_REQUEST', handlePlayerCreateRequest);
	yield takeEvery('PLAYER_CREATE_RESPONSE', handlePlayerCreateResponse);
	yield takeEvery('PLAYER_SET_MOVE_TARGET', handlePlayerSetMoveTarget);
	yield takeEvery('PLAYER_MOVE_TOWARDS', handlePlayerMoveTowards);
};

export default playerListener;
