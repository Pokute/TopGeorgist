import { put, select, takeEvery, all, call } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import { inventoryActions, InventoryItem, Inventory } from '../components/inventory';
import * as transactionActions from '../actions/transaction';
import * as taskQueueActions from '../actions/taskQueue';
import { TgoId, TgoType } from '../reducers/tgo';
import { TypeId, ItemType } from '../reducers/itemType';
import { TgosState } from '../reducers/tgos';
import { ItemTypesState } from '../reducers/itemTypes';

export interface TransactionParticipant {
	readonly tgoId: TgoId,
	readonly items: Inventory
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

	interface InventoryItemWithInfo extends InventoryItem {
		readonly type: ItemType,
		readonly ownerCount: number,
	};
	
	interface TransactionParticipantWithInfo {
		readonly tgoId: TgoId,
		readonly items: ReadonlyArray<InventoryItemWithInfo>
	};
	
	const getParticipantWithInfo = function*(p: TransactionParticipant) {
		const pTgo = yield select((state: { tgos: TgosState }) => state.tgos[p.tgoId]);
		const newItems: InventoryItemWithInfo = yield all(p.items.map((item) => call(function* (i) {
			return {
				...i,
				type: yield select((state: { itemTypes: ItemTypesState }) => state.itemTypes[i.typeId]),
				ownerCount: {
					count: 0,
					...(pTgo.inventory || []).find((ii : { typeId: TypeId }) => ii.typeId === i.typeId),
				}.count || 0,
			};
		}, item)));
		return {
			...p,
			items: newItems,
		};
	}

	const participantsWithInfo: ReadonlyArray<TransactionParticipantWithInfo> = yield all(participants.map(p => call(getParticipantWithInfo, p)));

	const participantsWithInfo2: ReadonlyArray<TransactionParticipantWithInfo> = yield* (participants.map(function* (p) {
		const pTgo = yield select((state: { tgos: TgosState }) => state.tgos[p.tgoId]);
		const newItems: InventoryItemWithInfo = yield p.items.map(function* (i) {
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
	}));

	const allPraticipantsHaveItems = participantsWithInfo.every((p) =>
		p.items.every(i =>
			(((i.ownerCount + i.count) >= 0) || !i.type.positiveOnly),
		),
	);
	if (!allPraticipantsHaveItems) return false; // There's not enough items to satisfy transaction.

	const actions: ReadonlyArray<ReturnType<typeof inventoryActions.add>> = participantsWithInfo.reduce(
		(total: ReadonlyArray<ReturnType<typeof inventoryActions.add>>, p) => [
			...total,
			...p.items.map(i => inventoryActions.add(p.tgoId, i.typeId, i.count)),
		],
		[],
	);

	yield all(actions.map(a => put(a)));
	return true;
};

const storeTransactionRequest = function* ({ payload: { tgoId, items, visitableTgoId } }: ReturnType<typeof transactionActions.storeTransactionRequest>) {
	yield put(taskQueueActions.addTaskQueue(
		tgoId,
		[{
			title: `Trading`,
			progress: {
				time: 0,
			},
			cost: {
				time: 12,
			},
			completionAction: transactionActions.transaction(
				{
					tgoId: tgoId,
					items: items,
				},
				{
					tgoId: visitableTgoId,
					items: items.map(i => ({ ...i, count: -1 * i.count })),
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
