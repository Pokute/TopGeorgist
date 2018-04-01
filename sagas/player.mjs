import { call, put, select, takeEvery } from 'redux-saga/effects';
import * as playerActions from '../actions/player';
import * as tgoActions from '../actions/tgo';
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

const handleQueueForOwner = function* (owner) {
	const getCompletedTasks = tasksQueue => tasksQueue
		.reduce(
			({ completed, remaining, continueCompleting }, task) => (
				(continueCompleting && task.cost && (task.progress.time >= task.cost.time))
					? {
						completed: [...completed, task],
						remaining,
						continueCompleting: true,
					}
					: {
						completed,
						remaining: [...remaining, task],
						continueCompleting: false,
					}
			),
			{ completed: [], remaining: [], continueCompleting: true },
		);

	const [topTask, ...restOfTaskQueue] = owner.taskQueue;
	const newTaskQueue = [
		{ ...topTask, progress: { time: topTask.progress.time + 1 } },
		...restOfTaskQueue,
	];
	const { completed: completedTasks, remaining: remainingTasks } = getCompletedTasks(newTaskQueue);

	// First remove completed items from TaskQueue so that other sagas see access them.
	yield put(playerActions.setTaskQueue(owner.tgoId, remainingTasks));

	if (completedTasks.some(task => task.PUT)) console.warn('Task action has a put already.');
	yield (completedTasks.map(task => put(task.action)));
	// let newTaskQueue = player.taskQueue;

	// } while (player)
};

const handleQueueTick = function* () {
	const s = yield select();
	const queueOwners = Object.values(s.tgos)
		.filter(tgo => (tgo.taskQueue && tgo.taskQueue.length > 0));

	for (const queueOwner of queueOwners) yield call(handleQueueForOwner, queueOwner);
};

const playerListener = function* () {
	yield takeEvery('PLAYER_CREATE_REQUEST', handlePlayerCreateRequest);
	yield takeEvery('PLAYER_CREATE_RESPONSE', handlePlayerCreateResponse);
	yield takeEvery('TICK', handleQueueTick);
};

export default playerListener;
