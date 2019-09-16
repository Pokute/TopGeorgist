import { default as test } from 'ava';
import sinon from 'sinon';
import { put, select, all } from 'redux-saga/effects';

import { omitType } from '../testUtils';
import { transaction } from '../actions/transaction';
import { TgoId } from '../reducers/tgo';
import { TypeId } from '../reducers/itemType';
import { TransactionParticipant, transactionSaga, transactionSaga2 } from '../sagas/transaction';
import { RootStateType } from '../reducers';
import { add } from '../components/inventory';
import { ItemTypesState } from '../reducers/itemTypes';
import { TgosState } from '../reducers/tgos';

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
	const tSaga = transactionSaga2(transaction(...[{
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

	// This would be the select.
	tSaga.next();

	const store = {
		itemTypes: {
			food: {
				typeId: 'food' as TypeId,
				stackable: true,

			},
			calories: {
				typeId: 'calories' as TypeId,
				stackable: true,
			},
		} as ItemTypesState,
		tgos: {
			'eater': {
				tgoId: 'eater' as TgoId,
				inventory: [
					{
						typeId: 'food' as TypeId,
						count: 1,
					},
				],
			},
		} as TgosState,
	} as unknown as RootStateType;

	// Give the store contents.
	const puts = tSaga.next(store).value;

	const resultAction = all([
		put(add('eater' as TgoId, 'food' as TypeId, -1)),
		put(add('eater' as TgoId, 'calories' as TypeId, 5)),
	]);

	t.deepEqual(
		puts,
		resultAction,
	);
});

test('./sagas/transaction.ts: transaction - insufficient resources', t => {
	const tSaga = transactionSaga2(transaction(...[{
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

	// This would be the select.
	tSaga.next();

	const store = {
		itemTypes: {
			food: {
				typeId: 'food' as TypeId,
				stackable: true,
				positiveOnly: true,
			},
			calories: {
				typeId: 'calories' as TypeId,
				stackable: true,
			},
		} as ItemTypesState,
		tgos: {
			'eater': {
				tgoId: 'eater' as TgoId,
				inventory: [
					{
						typeId: 'food' as TypeId,
						count: 0,
					},
				],
			},
		} as TgosState,
	} as unknown as RootStateType;

	// Give the store contents.
	t.throws(() => tSaga.next(store));
});

test('./sagas/transaction.ts: transaction - multi-participant case', t => {
	const tSaga = transactionSaga2(transaction(...[
		{
			tgoId: 'giver' as TgoId,
			items: [
				{
					typeId: 'food' as TypeId,
					count: -2,
				},
			]
		},
		{
			tgoId: 'receiver' as TgoId,
			items: [
				{
					typeId: 'food' as TypeId,
					count: 2,
				},
			]
		},
	]));

	// This would be the select.
	t.notDeepEqual(
		tSaga.next().value,
		select(() => {}),
	);

	const store = {
		itemTypes: {
			food: {
				typeId: 'food' as TypeId,
				stackable: true,
				positiveOnly: true,
			},
		} as ItemTypesState,
		tgos: {
			'giver': {
				tgoId: 'giver' as TgoId,
				inventory: [
					{
						typeId: 'food' as TypeId,
						count: 4,
					},
				],
			},
			'receiver': {
				tgoId: 'receiver' as TgoId,
				inventory: [
				],
			},
		} as TgosState,
	} as unknown as RootStateType;

	// Give the store contents.
	const puts = tSaga.next(store).value;

	const resultAction = all([
		put(add('giver' as TgoId, 'food' as TypeId, -2)),
		put(add('receiver' as TgoId, 'food' as TypeId, 2)),
	]);

	t.deepEqual(
		puts,
		resultAction,
	);
});

test('./sagas/transaction.ts: transaction - multi-participant, insufficient resources', t => {
	const tSaga = transactionSaga2(transaction(...[
		{
			tgoId: 'giver' as TgoId,
			items: [
				{
					typeId: 'food' as TypeId,
					count: -5,
				},
			]
		},
		{
			tgoId: 'receiver' as TgoId,
			items: [
				{
					typeId: 'food' as TypeId,
					count: 5,
				},
			]
		},
	]));

	// This would be the select.
	t.notDeepEqual(
		tSaga.next().value,
		select(() => {}),
	);

	const store = {
		itemTypes: {
			food: {
				typeId: 'food' as TypeId,
				stackable: true,
				positiveOnly: true,
			},
		} as ItemTypesState,
		tgos: {
			'giver': {
				tgoId: 'giver' as TgoId,
				inventory: [
					{
						typeId: 'food' as TypeId,
						count: 4,
					},
				],
			},
			'receiver': {
				tgoId: 'receiver' as TgoId,
				inventory: [
				],
			},
		} as TgosState,
	} as unknown as RootStateType;
	
	t.throws(() => tSaga.next(store));
});
