import { put, select, takeEvery } from 'redux-saga/effects';
import * as inventoryActions from '../actions/inventory';
import transctionAction from '../actions/transaction';
import * as playerActions from '../actions/player';

const transaction = function* (action) {
	const { participants } = action;

	if (!participants.every((p) => {
		if (!p) return false;
		if (!p.tgoId) return false;
		if (!p.items) return false;
		return true;
	})) {
		console.log('Participants are wrong!');
		return false;
	}
	// Items shape: { typeId, count };

	const participantsWithInfo = yield participants.map(function* (p) {
		const pTgo = yield select(state => state.tgos[p.tgoId]);
		const newItems = yield p.items.map(function* (i) {
			return {
				...i,
				type: yield select(state => state.itemTypes[i.typeId]),
				ownerCount: {
					count: 0,
					...(pTgo.inventory || []).find(ii => ii.typeId === i.typeId),
				}.count || 0,
			};
		});
		return {
			...p,
			items: newItems,
		};
	});

	const allPraticipantsHaveItems = participantsWithInfo.every(p =>
		p.items.every(i =>
			(((i.ownerCount + i.count) >= 0) || !i.type.positiveOnly),
		),
	);
	if (!allPraticipantsHaveItems) return false; // There's not enough items to satisfy transaction.

	const actions = participantsWithInfo.reduce(
		(total, p) => [
			...total,
			...p.items.map(i => inventoryActions.add(p.tgoId, i.typeId, i.count)),
		],
		[],
	);

	yield actions.map(function* (a) { yield put(a); });
	return true;
};

const storeTransactionRequest = function* (action) {
	yield put(playerActions.addTaskQueue(
		action.tgoId,
		[{
			title: `Trading`,
			progress: {
				time: 0,
			},
			cost: {
				time: 12,
			},
			action: transctionAction(
				{
					tgoId: action.tgoId,
					items: action.items,
				},
				{
					tgoId: action.visitableTgoId,
					items: action.items.map(i => ({ ...i, count: -1 * i.count })),
				},
			),
		}],
	));
};

const transactionListener = function* () {
	yield takeEvery('TRANSACTION', transaction);
	yield takeEvery('STORE_TRANSACTION_REQUEST', storeTransactionRequest);
};

export default transactionListener;
