import { put, select, takeEvery } from 'redux-saga/effects';
import { getType, ActionType } from 'typesafe-actions';

import { set as allSet } from '../actions/allSet';
import * as taskQueueActions from '../actions/taskQueue';
import * as tgoActions from '../actions/tgo';
import * as playerActions from '../actions/player';
import { createPlayerAction } from '../initialObjects';
import { TgoType } from '../reducers/tgo';
import topGeorgist from '../reducers';
import { setPlayerTgoId } from '../actions/defaults';
import { setPosition } from '../actions/tgo';

const handlePlayerCreateRequest = function* (action: ActionType<typeof playerActions.playerRequestServer>) {
	if (!global.isServer) return;
	console.log('Received playerCreateRequest ', action.payload.label);
	const state: ReturnType<typeof topGeorgist> = yield select();
	// const hasNameConflict = Object.values(yield select((state : { tgos: TgosState }) => state.tgos))
	// 	.some((tgo: TgoType) => (tgo.typeId === 'player') && (tgo.label === action.label));
	const hasNameConflict = Object.values(state.tgos)
		.some((tgo: TgoType) => (tgo.typeId === 'player') && (tgo.label === action.payload.label));
	if (hasNameConflict) return;

	const defaultPlayerAction = createPlayerAction();
	const newPlayerAction = {
		...defaultPlayerAction,
		tgo: {
			...defaultPlayerAction.payload.tgo,
			label: action.payload.label,
			position: {
				x: Math.trunc(15 * Math.random()),
				y: Math.trunc(15 * Math.random()),
			},
		},
	};
	yield put(newPlayerAction);

	const socket = state.clients[action.payload.clientId].socket;
	socket.sendAction(allSet({
		...(yield select()),
		clients: {},
	}));

	socket.sendAction(setPlayerTgoId(newPlayerAction.payload.tgo.tgoId));
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
	// yield takeEvery('PLAYER_CREATE_RESPONSE', handlePlayerCreateResponse);
	yield takeEvery(getType(tgoActions.setMoveTarget), handlePlayerSetMoveTarget);
	yield takeEvery('PLAYER_MOVE_TOWARDS', handlePlayerMoveTowards);
};

export default playerListener;
