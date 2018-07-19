import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import * as taskQueueActions from '../actions/taskQueue';
import * as tickerActions from '../actions/ticker';
import { RootStateType } from '../reducers';
import { TgoType } from '../reducers/tgo';
import { TaskQueueType, TaskType, checkTaskCompletion } from '../reducers/taskQueue';
import { AnyAction } from 'redux';

const handleQueueForOwner = function* (owner: TgoType) {
	if (!owner.taskQueue) return false;
	const getCompletedTasks = (tasksQueue: TaskQueueType) => tasksQueue
		.reduce(
			({ completed, remaining, continueCompleting }: { completed: TaskType[], remaining: TaskType[], continueCompleting: boolean}, task) => (
				(continueCompleting && checkTaskCompletion(task))
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

	const [topTask, ...restOfTaskQueue]: TaskType & TaskType[] = owner.taskQueue;

	const advanceTask = (task: TaskType): TaskType => ({
		...task,
		...(task.progress
			? {
				progress: {
					...task.progress,
					time: 1 + (task.progress.time || 0),
				},
			}
			: {}
		),
	});

	const generatedAdvanceActions = topTask.advanceActions || [];
	// const { generatedAdvanceActions, ...advancedTask }: AnyAction[] & any = advanceTask(topTask);

	const advancedTask = advanceTask(topTask);

	yield all(generatedAdvanceActions.map(a => put(a)));

	const newTaskQueue = [
		advancedTask,
		...restOfTaskQueue,
	];
	const { completed: completedTasks, remaining: remainingTasks } = getCompletedTasks(newTaskQueue);

	// First remove completed items from TaskQueue so that other sagas see access them.
	yield put(taskQueueActions.setTaskQueue(owner.tgoId, remainingTasks));

	if (completedTasks.some(task => task.hasOwnProperty('PUT'))) {
		console.warn('Task action has a PUT already.');
	}
	yield (completedTasks.filter(task => task.action).map((task: TaskType) => put(task.action as AnyAction)));
};

const handleQueueTick = function* () {
	const s: RootStateType = yield select();
	const queueOwners = Object.values(s.tgos)
		.filter(tgo => (tgo.taskQueue && tgo.taskQueue.length > 0));

	for (const queueOwner of queueOwners) yield call(handleQueueForOwner, queueOwner);
};

const queueListeners = function* () {
	yield takeEvery(getType(tickerActions.tick), handleQueueTick);
};

export default queueListeners;
