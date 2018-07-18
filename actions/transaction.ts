import { createAction } from 'typesafe-actions';

import { TransactionParticipant, TransactionItem } from '../sagas/transaction';
import { TgoId } from '../reducers/tgo';

export const transaction = createAction('TRANSACTION', (resolve) => {
	return (...participants: TransactionParticipant[]) => resolve({
		participants,
	});
});

export const storeTransactionRequest = createAction('STORE_TRANSACTION_REQUEST', (resolve) => {
	return (tgoId: TgoId, visitableTgoId: TgoId, items: TransactionItem[]) => resolve({
		tgoId,
		visitableTgoId,
		items,
	});
});
