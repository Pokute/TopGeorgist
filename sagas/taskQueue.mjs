import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import * as taskQueueActions from '../actions/taskQueue';

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

	const advanceTask = task => ({
		...task,
		...(task.progress
			? {
				progress: {
					...task.progress,
					time: task.progress.time + 1,
				},
			}
			: {}
		),
		...(task.advanceActions
			? {
				generatedAdvanceActions: task.advanceActions.map(a => a),
			}
			: {}
		),
	});

	const { generatedAdvanceActions, ...advancedTask } = advanceTask(topTask);

	yield all(generatedAdvanceActions.map(a => put(a)));

	const newTaskQueue = [
		advancedTask,
		...restOfTaskQueue,
	];
	const { completed: completedTasks, remaining: remainingTasks } = getCompletedTasks(newTaskQueue);

	// First remove completed items from TaskQueue so that other sagas see access them.
	yield put(taskQueueActions.setTaskQueue(owner.tgoId, remainingTasks));

	if (completedTasks.some(task => task.PUT)) console.warn('Task action has a put already.');
	yield (completedTasks.map(task => put(task.action)));
};

const handleQueueTick = function* () {
	const s = yield select();
	const queueOwners = Object.values(s.tgos)
		.filter(tgo => (tgo.taskQueue && tgo.taskQueue.length > 0));

	for (const queueOwner of queueOwners) yield call(handleQueueForOwner, queueOwner);
};

const queueListeners = function* () {
	yield takeEvery('TICK', handleQueueTick);
};

export default queueListeners;
