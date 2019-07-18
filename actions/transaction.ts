import { createAction } from 'typesafe-actions';

import { TransactionParticipant } from '../sagas/transaction';
import { TgoId } from '../reducers/tgo';
import { InventoryItem } from '../components/inventory';

export const transaction = createAction('TRANSACTION', (resolve) => {
	return (...participants: TransactionParticipant[]) => {
		if (participants.length == 0) throw new Error('Can\'t create a transaction with no participants');
		if (participants.some(p => !p.tgoId)) throw new Error('Transaction participant has no tgoId!');
		return resolve({
			participants,
		});
	};
});

export const storeTransactionRequest = createAction('STORE_TRANSACTION_REQUEST', (resolve) => {
	return (tgoId: TgoId, visitableTgoId: TgoId, items: ReadonlyArray<InventoryItem>) => resolve({
		tgoId,
		visitableTgoId,
		items,
	});
});
