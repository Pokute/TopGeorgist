import { createAction } from 'typesafe-actions';

import { TransactionParticipant } from '../sagas/transaction';
import { TgoId } from '../reducers/tgo';
import { InventoryItem } from '../components/inventory';

export const transaction = createAction('TRANSACTION', (resolve) => {
	return (...participants: TransactionParticipant[]) => resolve({
		participants,
	});
});

export const storeTransactionRequest = createAction('STORE_TRANSACTION_REQUEST', (resolve) => {
	return (tgoId: TgoId, visitableTgoId: TgoId, items: ReadonlyArray<InventoryItem>) => resolve({
		tgoId,
		visitableTgoId,
		items,
	});
});
