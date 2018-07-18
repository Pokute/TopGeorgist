import { put, select, takeEvery } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import * as inventoryActions from '../actions/inventory';
import * as transactionActions from '../actions/transaction';
import * as taskQueueActions from '../actions/taskQueue';
import { TgoId, TgoType } from '../reducers/tgo';
import { TypeId, ItemType } from '../reducers/itemType';
import { TgosState } from '../reducers/tgos';
import { ItemTypesState } from '../reducers/itemTypes';

export interface TransactionItem {
	typeId: TypeId,
	count: number,
};

export interface TransactionItemWithInfo extends TransactionItem {
	type: ItemType,
	ownerCount: number,
};

export interface TransactionParticipant {
	tgoId: TgoId,
	items: TransactionItem[]
};

export interface TransactionParticipantWithInfo {
	tgoId: TgoId,
	items: TransactionItemWithInfo[]
};

export type TransactionActionType = ActionType<typeof transactionActions>;

const transactionSaga = function* (action: ReturnType<typeof transactionActions.transaction>) {
	const { participants } = action.payload;

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

	const participantsWithInfo: TransactionParticipantWithInfo[] = yield participants.map(function* (p) {
		const pTgo = yield select((state: { tgos: TgosState }) => state.tgos[p.tgoId]);
		const newItems: TransactionItemWithInfo = yield p.items.map(function* (i) {
			return {
				...i,
				type: yield select((state: { itemTypes: ItemTypesState }) => state.itemTypes[i.typeId]),
				ownerCount: {
					count: 0,
					...(pTgo.inventory || []).find((ii : { typeId: TypeId }) => ii.typeId === i.typeId),
				}.count || 0,
			};
		});
		return {
			...p,
			items: newItems,
		};
	});

	const allPraticipantsHaveItems = participantsWithInfo.every((p) =>
		p.items.every(i =>
			(((i.ownerCount + i.count) >= 0) || !i.type.positiveOnly),
		),
	);
	if (!allPraticipantsHaveItems) return false; // There's not enough items to satisfy transaction.

	const actions: ReturnType<typeof inventoryActions.add>[] = participantsWithInfo.reduce(
		(total: ReturnType<typeof inventoryActions.add>[], p) => [
			...total,
			...p.items.map(i => inventoryActions.add(p.tgoId, i.typeId, i.count)),
		],
		[],
	);

	yield actions.map(function* (a) { yield put(a); });
	return true;
};

const storeTransactionRequest = function* (action: ReturnType<typeof transactionActions.storeTransactionRequest>) {
	yield put(taskQueueActions.addTaskQueue(
		action.payload.tgoId,
		[{
			title: `Trading`,
			progress: {
				time: 0,
			},
			cost: {
				time: 12,
			},
			action: transactionActions.transaction(
				{
					tgoId: action.payload.tgoId,
					items: action.payload.items,
				},
				{
					tgoId: action.payload.visitableTgoId,
					items: action.payload.items.map(i => ({ ...i, count: -1 * i.count })),
				},
			),
		}],
	));
};

const transactionListener = function* () {
	yield takeEvery('TRANSACTION', transactionSaga);
	yield takeEvery('STORE_TRANSACTION_REQUEST', storeTransactionRequest);
};

export default transactionListener;
