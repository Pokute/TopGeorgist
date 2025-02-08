import { createAction, getType } from 'typesafe-actions';
import { TypeId } from '../reducers/itemType.js';
import { transactionActions } from './transaction.js';
import { InventoryItem } from './inventory.js';
import { TgoId } from '../reducers/tgo.js';
import { put, takeEvery } from 'typed-redux-saga';
import isServer from '../isServer.js';


// Assumption: trading takes multiple ticks of time.
//	Why: instant trades are nifty, give some feedback and allow balancing opportunities.
// Assumption: trading could take specific tradeWork as input.
//	Why: Allow specialization for trade.
// Should allocate trade items from both sides at the start. Not crucial.
//	Why: For long works, will confuse the player if items are still present.
//	But: Will confuse players when trade is not yet complete, but the items are gone.
//		Fixable with better UX

export const tradeStoreTransactionRequest = createAction('TRADE_STORE_TRANSACTION_REQUEST',
	(tgoId: TgoId, visitableTgoId: TgoId, items: ReadonlyArray<InventoryItem>) => ({
		tgoId,
		visitableTgoId,
		items,
	})
)();

const tradeCost = [{
	typeId: 'trade' as TypeId,
	count: 1,
}];

export const handleTradeStoreTransactionRequest = function* ({ payload: { tgoId, items, visitableTgoId } }: ReturnType<typeof tradeStoreTransactionRequest>) {
	yield* put(transactionActions.transaction(
		{
			tgoId,
			items: tradeCost,
		},
		{
			tgoId: tgoId,
			items: items,
		},
		{
			tgoId: visitableTgoId,
			items: items.map(i => ({ ...i, count: -1 * i.count })),
		},
	));
};

export const tradeRootSaga = function* () {
	if (!isServer) return;
	yield* takeEvery(getType(tradeStoreTransactionRequest), handleTradeStoreTransactionRequest);
};
