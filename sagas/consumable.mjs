import { put, select, takeEvery } from 'redux-saga/effects';
import * as playerActions from '../actions/player';
import transaction from '../actions/transaction';

const consume = function* ({ actorTgoId, targetTypeId }) {
	const actorTgo = (yield select()).tgos[actorTgoId];
	const targetType = (yield select()).itemTypes[targetTypeId];
	if (!actorTgo.components.includes('consumer')) return false;
	if (!actorTgo.components.includes('player')) return false;

	yield put(playerActions.addTaskQueue(
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

const intoSeeds = function* ({ actorTgoId, targetTypeId }) {
	const targetType = (yield select()).itemTypes[targetTypeId];
	yield put(playerActions.addTaskQueue(
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
	yield takeEvery('CONSUMABLE_CONSUME', consume);
	yield takeEvery('CONSUMABLE_INTO_SEEDS', intoSeeds);
};

export default consumableRootSaga;
