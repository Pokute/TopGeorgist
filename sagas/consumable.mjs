import { call, fork, put, select, takeEvery } from 'redux-saga/effects';
import transaction from '../actions/transaction';

const consume = function* ({actorTgoId, targetTypeId}) {
	yield put(transaction({
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
	}));
}

const intoSeeds = function* ({actorTgoId, targetTypeId}) {
	yield put(transaction({
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
	}));
}

const consumableRootSaga = function*() {
	yield takeEvery('CONSUMABLE_CONSUME', consume);
	yield takeEvery('CONSUMABLE_INTO_SEEDS', intoSeeds);
};

export default consumableRootSaga;
