import test from 'ava';
import { Action } from 'redux'

import { add, addTgoId, removeTgoId, hasComponentInventory, Inventory, ComponentInventory, reducer } from '../components/inventory';

// We don't care about the type strings of actions.
// createAction also adds meta and error fields. Can't care about them either.
const omitType = <T extends Action & { meta?: any, error?: any }>(action: T) => {
	const { type, meta, error, ...withoutType }: { type: Action['type'], meta?: any, error?: any } = action;
	return withoutType as Omit<T, 'type'>;
}

// Action creators

test('./components/inventory.ts: add - action creator', (t) => {
	const action = add('testTgoId', 'testType', 1);
	const omitted = omitType(action);
	t.deepEqual(omitted, { payload: {
		tgoId: 'testTgoId',
		item: { typeId: 'testType', count: 1 },
	} });
});

test('./components/inventory.ts: add - throw on empty typeId', (t) => {
	t.throws(() => add('testTgoId', '', 1));
});

test('./components/inventory.ts: addTgoId - action creator', (t) => {
	const action = addTgoId('testTgoId', 'testChildTgoId');
	const omitted = omitType(action);
	t.deepEqual(omitted, { payload: {
		tgoId: 'testTgoId',
		item: { tgoId: 'testChildTgoId' },
	} });
});

test('./components/inventory.ts: addTgoId - throw on empty typeId', (t) => {
	t.throws(() => addTgoId('testTgoId', ''));
});

test('./components/inventory.ts: removeTgoId - action creator', (t) => {
	const action = removeTgoId('testTgoId', 'testChildTgoId');
	const omitted = omitType(action);
	t.deepEqual(omitted, { payload: {
		tgoId: 'testTgoId',
		item: { tgoId: 'testChildTgoId' },
	} });
});

test('./components/inventory.ts: removeTgoId - throw on empty typeId', (t) => {
	t.throws(() => removeTgoId('testTgoId', ''));
});

// Reducer

test('./components/inventory.ts: reducer:add - creates an inventory', (t) => {
	t.deepEqual(
		reducer(undefined, add('targetTgoId', 'typeId', 1)),
		[{
			typeId: 'typeId',
			count: 1,
		}]
	);
});

test('./components/inventory.ts: reducer:add - changes count, adds to existing list of objects', (t) => {
	t.deepEqual(
		reducer([
				{
					typeId: 'typeId',
					count: 4,
				}, {
					typeId: 'secondTypeId',
					count: 3,
				}
			],
			add('targetTgoId', 'typeId', -2)),
		[
			{
				typeId: 'secondTypeId',
				count: 3,
			},
			{
			typeId: 'typeId',
			count: 2,
			},
		]
	);
});

test('./components/inventory.ts: reducer:addTgoId - creates an inventory', (t) => {
	t.deepEqual(
		reducer(undefined, addTgoId('targetTgoId', 'ownedTgoId')),
		[{
			typeId: 'tgoId',
			tgoId: 'ownedTgoId',
			count: 1,
		}]
	);
});

test('./components/inventory.ts: reducer:addTgoId - throws if tgoId already in inventory', (t) => {
	t.throws(() =>
		reducer([{
			typeId: 'tgoId',
			tgoId: 'ownedTgoId',
			count: 1,
		}], addTgoId('targetTgoId', 'ownedTgoId'))
	);
});

test('./components/inventory.ts: reducer:removeTgoId', (t) => {
	t.deepEqual(
		reducer([
			{
				typeId: 'tgoId',
				tgoId: 'ownedTgoId',
				count: 1,
			}, {
				typeId: 'secondTypeId',
				count: 3,
			}
		], removeTgoId('targetTgoId', 'ownedTgoId')),
		[{
			typeId: 'secondTypeId',
			count: 3,
		}]
	);
});

test('./components/inventory.ts: reducer:removeTgoId - throws if tgoId not in inventory', (t) => {
	t.throws(() =>
		reducer([], removeTgoId('targetTgoId', 'ownedTgoId'))
	);
});

// Type inference

test('./components/inventory.ts: hasComponentInventory passes', (t) => {
	t.true(hasComponentInventory({ tgoId: 'testTgoId', inventory: [] }));
});

test('./components/inventory.ts: hasComponentInventory fails', (t) => {
	// Typescript actually handles most of this already.
	t.false(hasComponentInventory({ tgoId: 'testTgoId', notInventory: [] } as unknown as ComponentInventory));
});
