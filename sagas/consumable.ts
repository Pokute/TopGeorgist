import { put, select, takeEvery } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import * as taskQueueActions from '../actions/taskQueue';
import { transaction } from '../actions/transaction';
import * as consumableActions from '../actions/consumable';

const consume = function* ({ payload: { actorTgoId, targetTypeId } }: ActionType<typeof consumableActions.consume>) {
	const actorTgo = (yield select()).tgos[actorTgoId];
	const targetType = (yield select()).itemTypes[targetTypeId];
	if (!actorTgo.components.includes('consumer')) return false;
	if (!actorTgo.components.includes('player')) return false;

	yield put(taskQueueActions.addTaskQueue(
		actorTgoId,
		[{
			title: `Eating ${targetType.label}`,
			progress: {
				time: 0,
			},
			cost: {
				time: 20,
			},
			action: transaction({
				tgoId: actorTgoId,
				items: [
					{
						typeId: 'calories',
						count: +500,
					},
					{
						typeId: targetTypeId,
						count: -1,
					},
				],
			}),
		}],
	));
	return true;
};

const intoSeeds = function* ({ payload: { actorTgoId, targetTypeId } }: ActionType<typeof consumableActions.intoSeeds>) {
	const targetType = (yield select()).itemTypes[targetTypeId];
	yield put(taskQueueActions.addTaskQueue(
		actorTgoId,
		[{
			title: `Extracting seeds from ${targetType.label}`,
			progress: {
				time: 0,
			},
			cost: {
				time: 50,
			},
			action: transaction({
				tgoId: actorTgoId,
				items: [
					{
						typeId: 'pineAppleShoot',
						count: +2,
					},
					{
						typeId: targetTypeId,
						count: -1,
					},
				],
			}),
		}],
	));
};

const consumableRootSaga = function* () {
	yield takeEvery(getType(consumableActions.consume), consume);
	yield takeEvery(getType(consumableActions.intoSeeds), intoSeeds);
};

export default consumableRootSaga;
