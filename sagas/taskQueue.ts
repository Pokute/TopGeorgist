import { all, call, put, takeEvery }  from 'typed-redux-saga';
import { ActionType, getType } from 'typesafe-actions';

import * as taskQueueActions from '../actions/taskQueue.js';
import { tick } from '../concerns/ticker.js';
import { TgoType } from '../reducers/tgo.js';
import { TaskQueueType, TaskType, checkTaskCompletion } from '../reducers/taskQueue.js';
import { AnyAction } from 'redux';
import tgos from '../reducers/tgos.js';
import { select } from '../redux-saga-helpers.js';

const handleQueueForOwner = function* (owner: TgoType) {
	if (!owner.taskQueue) return false;
	console.log('TaskQueue: ', owner.taskQueue);
	const getCompletedTasks = (tasksQueue: TaskQueueType) => tasksQueue
		.reduce(
			({ completed, remaining, continueCompleting }: { completed: ReadonlyArray<TaskType>, remaining: ReadonlyArray<TaskType>, continueCompleting: boolean}, task) => (
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

	const [topTask, ...restOfTaskQueue]: TaskType & ReadonlyArray<TaskType> = owner.taskQueue;

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

	yield* all(generatedAdvanceActions.map(a => put(a)));

	const newTaskQueue = [
		advancedTask,
		...restOfTaskQueue,
	];
	const { completed: completedTasks, remaining: remainingTasks } = getCompletedTasks(newTaskQueue);

	// First remove completed items from TaskQueue so that other sagas see access them.
	yield* put(taskQueueActions.setTaskQueue(owner.tgoId, remainingTasks));

	if (completedTasks.some(task => task.hasOwnProperty('PUT'))) {
		console.warn('Task action has a PUT already.');
	}
	yield* (completedTasks.filter(task => task.completionAction).map((task: TaskType) => put(task.completionAction as AnyAction)));
};

const handleQueueTick = function* () {
	// console.log('HandleQueue');
	const s = yield* select();
	// console.log(Object.values(s.tgos)[Object.values(s.tgos).length - 1]);
	const queueOwners = Object.values(s.tgos)
		.filter(tgo => (tgo.taskQueue && tgo.taskQueue.length > 0));

	for (const queueOwner of queueOwners) yield* call(handleQueueForOwner, queueOwner);
};

const queueListeners = function* () {
	yield* takeEvery(getType(tick), handleQueueTick);
};

export default queueListeners;
