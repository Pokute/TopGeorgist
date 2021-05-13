import test from 'ava';

import { omitType } from '../testUtils.js';
import { add, addTgoId, removeTgoId, hasComponentInventory, Inventory, ComponentInventory, reducer } from '../components/inventory.js';
import { TgoId } from '../reducers/tgo.js';
import { TypeId } from '../reducers/itemType.js';

// Action creators

test('./components/inventory.ts: add - action creator', (t) => {
	const action = add('testTgoId' as TgoId, 'testType' as TypeId, 1);
	const omitted = omitType(action);
	t.deepEqual(omitted, { payload: {
		tgoId: 'testTgoId',
		item: { typeId: 'testType', count: 1 },
	} });
});

test('./components/inventory.ts: add - throw on empty typeId', (t) => {
	t.throws(() => add('testTgoId' as TgoId, '' as TypeId, 1));
});

test('./components/inventory.ts: addTgoId - action creator', (t) => {
	const action = addTgoId('testTgoId' as TgoId, 'testChildTgoId' as TgoId);
	const omitted = omitType(action);
	t.deepEqual(omitted, { payload: {
		tgoId: 'testTgoId',
		item: { tgoId: 'testChildTgoId' as TgoId },
	} });
});

test('./components/inventory.ts: addTgoId - throw on empty typeId', (t) => {
	t.throws(() => addTgoId('testTgoId' as TgoId, '' as TgoId));
});

test('./components/inventory.ts: removeTgoId - action creator', (t) => {
	const action = removeTgoId('testTgoId' as TgoId, 'testChildTgoId' as TgoId);
	const omitted = omitType(action);
	t.deepEqual(omitted, { payload: {
		tgoId: 'testTgoId' as TgoId,
		item: { tgoId: 'testChildTgoId' as TgoId },
	} });
});

test('./components/inventory.ts: removeTgoId - throw on empty typeId', (t) => {
	t.throws(() => removeTgoId('testTgoId' as TgoId, '' as TgoId));
});

// Reducer

test('./components/inventory.ts: reducer:add - creates an inventory', (t) => {
	t.deepEqual(
		reducer(undefined, add('targetTgoId' as TgoId, 'typeId' as TypeId, 1)),
		[{
			typeId: 'typeId' as TypeId,
			count: 1,
		}]
	);
});

test('./components/inventory.ts: reducer:add - changes count, adds to existing list of objects', (t) => {
	t.deepEqual(
		reducer([
				{
					typeId: 'typeId' as TypeId,
					count: 4,
				}, {
					typeId: 'secondTypeId' as TypeId,
					count: 3,
				}
			],
			add('targetTgoId' as TgoId, 'typeId' as TypeId, -2)),
		[
			{
				typeId: 'secondTypeId' as TypeId,
				count: 3,
			},
			{
			typeId: 'typeId' as TypeId,
			count: 2,
			},
		]
	);
});

test('./components/inventory.ts: reducer:addTgoId - creates an inventory', (t) => {
	t.deepEqual(
		reducer(undefined, addTgoId('targetTgoId' as TgoId, 'ownedTgoId' as TgoId)),
		[{
			typeId: 'tgoId' as TypeId,
			tgoId: 'ownedTgoId' as TgoId,
			count: 1,
		}]
	);
});

test('./components/inventory.ts: reducer:addTgoId - throws if tgoId already in inventory', (t) => {
	t.throws(() =>
		reducer([{
			typeId: 'tgoId' as TypeId,
			tgoId: 'ownedTgoId' as TgoId,
			count: 1,
		}], addTgoId('targetTgoId' as TgoId, 'ownedTgoId' as TgoId))
	);
});

test('./components/inventory.ts: reducer:removeTgoId', (t) => {
	t.deepEqual(
		reducer([
			{
				typeId: 'tgoId' as TypeId,
				tgoId: 'ownedTgoId' as TgoId,
				count: 1,
			}, {
				typeId: 'secondTypeId' as TypeId,
				count: 3,
			}
		], removeTgoId('targetTgoId' as TgoId, 'ownedTgoId' as TgoId)),
		[{
			typeId: 'secondTypeId' as TypeId,
			count: 3,
		}]
	);
});

test('./components/inventory.ts: reducer:removeTgoId - throws if tgoId not in inventory', (t) => {
	t.throws(() =>
		reducer([], removeTgoId('targetTgoId' as TgoId, 'ownedTgoId' as TgoId))
	);
});

// Type inference

test('./components/inventory.ts: hasComponentInventory passes', (t) => {
	t.true(hasComponentInventory({ tgoId: 'testTgoId' as TgoId, inventory: [] }));
});

test('./components/inventory.ts: hasComponentInventory fails', (t) => {
	// Typescript actually handles most of this already.
	t.false(hasComponentInventory({ tgoId: 'testTgoId' as TgoId, notInventory: [] } as unknown as ComponentInventory));
});
