import { call, fork, put, select, takeEvery } from 'redux-saga/effects';
import transaction from '../actions/transaction';

const consume = function* ({actorTgoId, consumableTypeId}) {
	yield put(transaction({
		tgoId: actorTgoId,
		items: [
			{
				typeId: 'calories',
				count: +500,
			},
			{
				typeId: consumableTypeId,
				count: -1,
			},
		],
	}));
}

const consumableRootSaga = function*() {
	yield takeEvery('CONSUMABLE_CONSUME', consume);
};

export default consumableRootSaga;
