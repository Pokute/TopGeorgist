import test from 'ava';
import { takeEvery } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import { add as addTgo } from '../actions/tgos';
import { selectTgo } from '../concerns/tgos';
import { TgoId } from '../reducers/tgo';
import { add as addItemType } from '../actions/itemTypes';
import { TypeId, ItemType } from '../reducers/itemType';
import { Inventory } from '../components/inventory';
import { TransactionParticipant, transaction } from '../concerns/transaction';
import rootReducer from '../reducers';
import rootSaga from '../sagas/root';
import Sinon from 'sinon';

// Test transactions

// See https://github.com/antoinejaussoin/redux-saga-testing/blob/master/ava/06.saga-using-selectors.test.js
//  for how to write it.

// Action creator

test.afterEach(() => {
	Sinon.restore();
})

test('./actions/transaction.ts: transaction - action creator works', t => {
	t.notThrows(() => transaction(...[
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
	]));
});

test('./actions/transaction.ts: transaction - action creator - fail on no participants', t => {
	t.throws(() => transaction(...[]));
});

test('./actions/transaction.ts: transaction - action creator - fail on no participant tgoId', t => {
	// Typescript actually handles most of this already.
	t.throws(() => transaction(...[{
		items: [],
	} as unknown as TransactionParticipant]));
});

// Saga

const setupRedux = () => expectSaga(rootSaga)
	.withReducer(rootReducer);

const itemTypes: Record<string, Partial<ItemType> & { typeId: TypeId }> = {
	food: {	typeId: 'food' as TypeId },
	calories: {	typeId: 'calories' as TypeId },
} as const;

test('./sagas/transaction.ts: transaction - simple case', async t => {
	const initialInventory = [
		{
			typeId: 'food' as TypeId,
			count: 20,
		},
		{
			typeId: 'calories' as TypeId,
			count: 25,
		}
	];
	const inventoryChange = [
		{
			typeId: 'food' as TypeId,
			count: -1,
		},
		{
			typeId: 'calories' as TypeId,
			count: 5,
		},
	];

	const createEaterTgo = addTgo({
		inventory: initialInventory,
	});
	const { tgoId: eaterTgoId } = createEaterTgo.payload.tgo;
	const { storeState } = await setupRedux()
		.dispatch(addItemType(itemTypes['food']))
		.dispatch(addItemType(itemTypes['calories']))
		.dispatch(createEaterTgo)
		.dispatch(transaction(...[{
			tgoId: eaterTgoId,
			items: inventoryChange,
		}]))
		.silentRun(0);
	
	t.deepEqual(selectTgo(storeState, eaterTgoId).inventory, [
		{
			typeId: 'food' as TypeId,
			count: 19,
		},
		{
			typeId: 'calories' as TypeId,
			count: 30,
		},
	]);
});

test('./sagas/transaction.ts: transaction - fail on no matching item type', async t => {
	const initialInventory = [
		{
			typeId: 'unknown' as TypeId,
			count: 20,
		},
	];
	const inventoryChange = [
		{
			typeId: 'unknown' as TypeId,
			count: -1,
		},
	];

	const createEaterTgo = addTgo({
		inventory: initialInventory,
	});
	const { tgoId: eaterTgoId } = createEaterTgo.payload.tgo;

	const errorStub = Sinon.stub(console, 'error');

	const { storeState } = await setupRedux()
		.dispatch(createEaterTgo)
		.dispatch(transaction(...[{
			tgoId: eaterTgoId,
			items: inventoryChange,
		}]))
		.silentRun(0);
	
	t.deepEqual(selectTgo(storeState, eaterTgoId).inventory, [
		{
			typeId: 'unknown' as TypeId,
			count: 20,
		},
	]);

	t.assert(errorStub.calledOnce);
});

test('./sagas/transaction.ts: transaction - insufficient resources', async t => {
	const initialInventory = [
		{
			typeId: 'food' as TypeId,
			count: 0,
		},
		{
			typeId: 'calories' as TypeId,
			count: 25,
		}
	];
	const inventoryChange = [
		{
			typeId: 'food' as TypeId,
			count: -1,
		},
		{
			typeId: 'calories' as TypeId,
			count: 5,
		},
	];

	const createEaterTgo = addTgo({
		inventory: initialInventory,
	});
	const { tgoId: eaterTgoId } = createEaterTgo.payload.tgo;

	const errorStub = Sinon.stub(console, 'error');

	const { storeState } = await setupRedux()
		.dispatch(addItemType(itemTypes['food']))
		.dispatch(addItemType(itemTypes['calories']))
		.dispatch(createEaterTgo)
		.dispatch(transaction(...[{
			tgoId: eaterTgoId,
			items: inventoryChange,
		}]))
		.silentRun(0);
	
	t.deepEqual(selectTgo(storeState, eaterTgoId).inventory, initialInventory);

	t.assert(errorStub.calledOnce);
});

test('./sagas/transaction.ts: transaction - multi-participant case', async t => {
	const initialGiverInventory = [
		{
			typeId: 'food' as TypeId,
			count: 5,
		},
	];
	const createGiverTgo = addTgo({
		inventory: initialGiverInventory,
	});
	const { tgoId: giverTgoId } = createGiverTgo.payload.tgo;
	const initialReceiverInventory: Inventory = [];
	const createReceiverTgo = addTgo({
		inventory: initialReceiverInventory,
	});
	const { tgoId: receiverTgoId } = createReceiverTgo.payload.tgo;
	const { storeState } = await setupRedux()
		.dispatch(addItemType(itemTypes['food']))
		.dispatch(createGiverTgo)
		.dispatch(createReceiverTgo)
		.dispatch(transaction(...[
			{
				tgoId: giverTgoId,
				items: [{
					typeId: 'food' as TypeId,
					count: -2,
				}],
			},
			{
				tgoId: receiverTgoId,
				items: [{
					typeId: 'food' as TypeId,
					count: 2,
				}],
			},
		]))
		.silentRun(0);
	
	t.deepEqual(selectTgo(storeState, giverTgoId).inventory, [{
		...initialGiverInventory[0],
		count: 3,
	}]);
	t.deepEqual(selectTgo(storeState, receiverTgoId).inventory, [{
		typeId: 'food' as TypeId,
		count: 2,
	}]);
});

test('./sagas/transaction.ts: transaction - multi-participant, insufficient resources', async t => {
	const initialGiverInventory = [
		{
			typeId: 'food' as TypeId,
			count: 5,
		},
	];
	const createGiverTgo = addTgo({
		inventory: initialGiverInventory,
	});
	const { tgoId: giverTgoId } = createGiverTgo.payload.tgo;
	const initialReceiverInventory: Inventory = [];
	const createReceiverTgo = addTgo({
		inventory: initialReceiverInventory,
	});
	const { tgoId: receiverTgoId } = createReceiverTgo.payload.tgo;

	const errorStub = Sinon.stub(console, 'error');

	const { storeState } = await setupRedux()
		.dispatch(addItemType(itemTypes['food']))
		.dispatch(createGiverTgo)
		.dispatch(createReceiverTgo)
		.dispatch(transaction(...[
			{
				tgoId: giverTgoId,
				items: [{
					typeId: 'food' as TypeId,
					count: -6,
				}],
			},
			{
				tgoId: receiverTgoId,
				items: [{
					typeId: 'food' as TypeId,
					count: 6,
				}],
			},
		]))
		.silentRun(0);
	
	t.deepEqual(selectTgo(storeState, giverTgoId).inventory, initialGiverInventory);
	t.deepEqual(selectTgo(storeState, receiverTgoId).inventory, initialReceiverInventory);
	
	t.assert(errorStub.calledOnce);
});

test('./sagas/transaction.ts: transaction - virtual inventories can have negative values of positiveOnly types', async t => {
	const initialInventory = [
		{
			typeId: 'food' as TypeId,
			count: 2,
		},
	];
	const inventoryChange = [
		{
			typeId: 'food' as TypeId,
			count: -5,
		},
	];

	const createEaterTgo = addTgo({
		inventory: initialInventory,
		isInventoryVirtual: true,
	});
	const { tgoId: eaterTgoId } = createEaterTgo.payload.tgo;
	const { storeState } = await setupRedux()
		.dispatch(addItemType(itemTypes['food']))
		.dispatch(addItemType(itemTypes['calories']))
		.dispatch(createEaterTgo)
		.dispatch(transaction(...[{
			tgoId: eaterTgoId,
			items: inventoryChange,
		}]))
		.silentRun(0);
	
	t.deepEqual(selectTgo(storeState, eaterTgoId).inventory, [
		{
			typeId: 'food' as TypeId,
			count: -3,
		},
	]);
});
