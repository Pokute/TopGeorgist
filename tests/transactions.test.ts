import { default as test } from 'ava';
import sinon from 'sinon';

import { omitType } from '../testUtils';
import { transaction } from '../actions/transaction';
import { TgoId } from '../reducers/tgo';
import { TypeId } from '../reducers/itemType';
import { TransactionParticipant, transactionSaga } from '../sagas/transaction';

// Test transactions

// See https://github.com/antoinejaussoin/redux-saga-testing/blob/master/ava/06.saga-using-selectors.test.js
//  for how to write it.

// Action creator

test('./actions/transaction.ts: transaction - action creator', t => {
	t.deepEqual(omitType(transaction(...[
		{
			tgoId: 'buyer' as TgoId,
			items: [
				{
					typeId: 'money' as TypeId,
					count: -5,
				},
				{
					typeId: 'cake' as TypeId,
					count: 1,
				}
			],
		},
		{
			tgoId: 'seller' as TgoId,
			items: [
				{
					typeId: 'money' as TypeId,
					count: 5,
				},
				{
					typeId: 'cake' as TypeId,
					count: -1,
				}
			],
		},
	])), {
		payload: {
			participants: [
				{
					tgoId: 'buyer' as TgoId,
					items: [
						{
							typeId: 'money' as TypeId,
							count: -5,
						},
						{
							typeId: 'cake' as TypeId,
							count: 1,
						}
					],
				},
				{
					tgoId: 'seller' as TgoId,
					items: [
						{
							typeId: 'money' as TypeId,
							count: 5,
						},
						{
							typeId: 'cake' as TypeId,
							count: -1,
						}
					],
				},
			]
		}
	});
});

test('./actions/transaction.ts: transaction - fail on no participants', t => {
	t.throws(() => transaction(...[]));
});

test('./actions/transaction.ts: transaction - fail on no participant tgoId', t => {
	// Typescript actually handles most of this already.
	t.throws(() => transaction(...[{
		items: [],
	} as unknown as TransactionParticipant]));
});

// Saga

test('./sagas/transaction.ts: transaction - simple case', t => {
	const tSaga = transactionSaga(transaction(...[{
		tgoId: 'eater' as TgoId,
		items: [
			{
				typeId: 'food' as TypeId,
				count: -1,
			},
			{
				typeId: 'calories' as TypeId,
				count: 5,
			},
		]
	}]));

	t.deepEqual(
		tSaga.next(),
		{}
	);

	t.deepEqual(
		tSaga.next(),
		{},
	);

	t.deepEqual(
		tSaga.next(),
		{
			done: true,
		}
	);
});

test.todo('./sagas/transaction.ts: transaction - insufficient resources');

test.todo('./sagas/transaction.ts: transaction - multi-participant case');

test.todo('./sagas/transaction.ts: transaction - multi-participant, insufficient resources');
