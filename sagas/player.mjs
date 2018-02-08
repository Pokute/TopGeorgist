import { put, select, takeEvery } from 'redux-saga/effects';
// import * as playerActions from '../actions/player';
import * as tgoActions from '../actions/tgo';
import { createPlayerAction } from '../initialObjects'

const handlePlayerCreateRequest = function*(action) {
	if (!global.isServer) return;
	console.log('Received playerCreateRequest ', action.label)
	const hasNameConflict = (yield select(state => state.tgos))
		.some(tgo => (tgo.typeId === 'player') && (tgo.label === action.label))
	if (!hasNameConflict) {
		const defaultPlayerAction = createPlayerAction();
		const newPlayerAction = {
			...defaultPlayerAction,
			tgo: {
				...defaultPlayerAction.tgo,
				label: action.label,
			}
		};
		yield put(newPlayerAction);

		const socket = yield select(state => state.clients.find(c => c.clientId === action.clientId).socket);
		socket.send(JSON.stringify({
			action: {
				type: 'ALL_SET',
				data: { ...(yield select()), clients:[] }
			}
		}));
		socket.send(JSON.stringify({
			action: {
				type: 'DEFAULTS_SET_PLAYER',
				tgoId: newPlayerAction.tgo.tgoId,
			}
		}));
	}
};

const handlePlayerCreateResponse = function*(action) {
	if (global.isServer) return;
	yield put({
		type: 'DEFAULTS_SET_PLAYER',
		playerId: action.tgoId,
	});
};

const playerListener = function*() {
	yield takeEvery('PLAYER_CREATE_REQUEST', handlePlayerCreateRequest);
	yield takeEvery('PLAYER_CREATE_RESPONSE', handlePlayerCreateResponse);
};

export default playerListener;
