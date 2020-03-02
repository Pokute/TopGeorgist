import util from 'util';
import { default as test, DeepEqualAssertion, ExecutionContext } from 'ava';
import sinon from 'sinon';
import { handleCreateWorkInstance, handleWorkInstance } from '../sagas/work';
import { createWorkInstance } from '../actions/workInstance';
import { consume } from '../data/recipes';
import { TgoId, TgoType } from '../reducers/tgo';
import { getType } from 'typesafe-actions';
import { WSAEMSGSIZE } from 'constants';
import { select, put, PutEffect, PutEffectDescriptor } from 'redux-saga/effects';
import { RootStateType } from '../reducers';
import { omitType, omitMetaAndError, overrideTgoWithId, overrideAddTgoActionWithId } from '../testUtils';
import { TypeId } from '../reducers/itemType';
import { ItemTypesState } from '../reducers/itemTypes';
import { TgosState } from '../reducers/tgos';
import { add as addTgo } from '../actions/tgos';
import { addTgoId as inventoryAddTgoId } from '../components/inventory';
import { addWorkInstance as goalAddWorkInstance, removeWorkInstance } from '../actions/goal';
import { ComponentWork, ComponentGoal } from '../data/components_new';
import { transaction } from '../actions/transaction';

// Test work

util.inspect.defaultOptions.depth = 500;  

test('Create a work instance', t => {
	const params = {
		goalTgoId: 'Temp goal id' as TgoId,
		targetTgoId: 'Target id' as TgoId,
		recipe: consume,
	};

	t.deepEqual(
		omitMetaAndError(createWorkInstance(params)),
		{
			type: getType(createWorkInstance),
			payload: params,
		}
	);
});

test('Test work - handleCreateWorkInstance - fail if goalTgoId not in store', t => {
	const params = {
		goalTgoId: 'Temp goal id' as TgoId,
		targetTgoId: 'Target id' as TgoId,
		recipe: consume,
	};

	const wSaga = handleCreateWorkInstance(createWorkInstance(params));

	t.deepEqual(
		wSaga.next( ).value,
		select()
	);

	t.true(
		wSaga.next({ tgos: {} } as unknown as RootStateType as any).done
	);
});

test('Test work - creates a tgo for virtual inventory if it doesn\'t exist and work.actorItemChanges.length > 0', t => {
	const params = {
		goalTgoId: 'Temp goal id' as TgoId,
		targetTgoId: 'Target id' as TgoId,
		recipe: consume,
	};

	const wSaga = handleCreateWorkInstance(createWorkInstance(params));

	t.deepEqual(
		wSaga.next().value,
		select()
	);

	const goalTgo: TgoType & ComponentGoal = {
		tgoId: 'Temp goal id' as TgoId,
		goal: {
			requirements: [],
			workInstances: [],
		},
	};

	const wSagaAddTgoPut = wSaga.next({ tgos: {
		[goalTgo.tgoId]: goalTgo,
	} as TgosState } as unknown as RootStateType as any).value;

	type AddTgoType = ReturnType<typeof addTgo>;

	const isPutEffect = (a: any): a is PutEffect => a && a.type === 'PUT';
	const isAddAction = (a: any): a is AddTgoType => a && a.type === getType(addTgo);
	const isInventoryAddTgoIdAction = (a: any): a is ReturnType<typeof inventoryAddTgoId> => a && a.type === getType(inventoryAddTgoId);
	const isGoalAddWorkInstanceAction = (a: any): a is ReturnType<typeof goalAddWorkInstance> => a && a.type === getType(goalAddWorkInstance);

	// Testing internals here. :-(
	const emptyVirtualInventory = {
		inventory: [],
		isInventoryVirtual: true,
	};

	if (!isPutEffect(wSagaAddTgoPut) || !isAddAction(wSagaAddTgoPut.payload.action)) {
		t.fail();
		return;
	}
	const overridden = overrideAddTgoActionWithId(
		addTgo(emptyVirtualInventory),
		wSagaAddTgoPut.payload.action.payload.tgo.tgoId
	);
	t.deepEqual(
		wSagaAddTgoPut,
		put(overridden)
	);

	const wSagaSecondAddTgoPut = wSaga.next().value;
	if (!isPutEffect(wSagaSecondAddTgoPut) || !isAddAction(wSagaSecondAddTgoPut.payload.action)) {
		t.fail();
		return;
	}

	const overriddenS = overrideAddTgoActionWithId(
		addTgo(emptyVirtualInventory),
		wSagaSecondAddTgoPut.payload.action.payload.tgo.tgoId
	);
	t.deepEqual(
		wSagaSecondAddTgoPut,
		put(overriddenS)
	);

	const wSagaAddWorkTgoPut = wSaga.next().value;
	if (!isPutEffect(wSagaAddWorkTgoPut) || !isAddAction(wSagaAddWorkTgoPut.payload.action)) {
		t.fail();
		return;
	}

	const overriddenW = overrideAddTgoActionWithId(
		addTgo({
			workRecipe: consume,
			workTargetTgoId: 'Target id' as TgoId,
			workActorCommittedItemsTgoId: wSagaAddTgoPut.payload.action.payload.tgo.tgoId,
			workTargetCommittedItemsTgoId: wSagaSecondAddTgoPut.payload.action.payload.tgo.tgoId,
		}),
		wSagaAddWorkTgoPut.payload.action.payload.tgo.tgoId
	);
	t.deepEqual(
		wSagaAddWorkTgoPut,
		put(overriddenW)
	);

	const inventoryAddToGoal = wSaga.next(wSagaAddWorkTgoPut.payload.action as any).value;
	if (!isPutEffect(inventoryAddToGoal) || !isInventoryAddTgoIdAction(inventoryAddToGoal.payload.action)) {
		t.fail();
		return;
	}
	t.deepEqual(
		inventoryAddToGoal,
		put(inventoryAddTgoId('Temp goal id' as TgoId, inventoryAddToGoal.payload.action.payload.item.tgoId))
	);
	const workInstanceAdd = wSaga.next().value;
	if (!isPutEffect(workInstanceAdd) || !isGoalAddWorkInstanceAction(workInstanceAdd.payload.action)) {
		t.fail();
		return;
	}
	t.deepEqual(
		workInstanceAdd,
		put(goalAddWorkInstance('Temp goal id' as TgoId, wSagaAddWorkTgoPut.payload.action.payload.tgo.tgoId))
	)
	t.true(wSaga.next().done);
});

const createGenDeepEqual = <G extends Generator>(t: ExecutionContext, gen: G) => (next?: any) => (expected?: Parameters<DeepEqualAssertion>[1], done: boolean = false, message?: Parameters<DeepEqualAssertion>[2]) => {
	const genResult = gen.next(next);
	if (expected) {
		t.deepEqual(
			genResult,
			{
				value: expected,
				done,
			},
		);
	} else {
		t.true(genResult.done === done);
	}
	return genResult;
}

test('Work - empty work', t => {
	// Create an empty work instance.
	const workInstance: ComponentWork = {
		tgoId: 'emptyWork instance' as TgoId,
		workRecipe: {
			actorItemChanges: [],
			targetItemChanges: [],
			type: 'emptyWork',
		},
	};

	// Run empty work instance.
	const hWI = handleWorkInstance(
		{ tgoId: 'worker' as TgoId, activeGoals: [], inventory: [] },
		{ tgoId: 'goal' as TgoId, goal: { requirements: [], workInstances: [workInstance.tgoId] }, inventory: [], },
		workInstance,
		);
	// Is a generator;
	t.truthy(hWI && hWI.next);
	
	const genDeepEqual = createGenDeepEqual(t, hWI);

	// Start execution
	genDeepEqual()();

	// Supply the store;
	genDeepEqual(
		{ tgos: {
			['Temp goal id']: {
				tgoId: 'Temp goal id' as TgoId,
			}
		} as TgosState } as unknown as RootStateType as any
	)(undefined, true);
});

test('Work - wait 3 ticks', t => {
	const workInstanceCommittedItemsTgo = {
		tgoId: 'waitWorkCommittedItems' as TgoId,
		inventory: [],
		isInventoryVirtual: true,
	};

	// Create an work instance on 3 tick wait.
	const workInstance: ComponentWork = {
		tgoId: 'waitWork instance' as TgoId,
		workActorCommittedItemsTgoId: workInstanceCommittedItemsTgo.tgoId,
		workRecipe: {
			actorItemChanges: [{
				typeId: 'tick' as TypeId,
				count: -3,
			}],
			targetItemChanges: [],
			type: 'waitWork',
		},
	};

	for (let i = 0; i < 5; i++) {
		let hWI = handleWorkInstance(
			{ tgoId: 'worker' as TgoId, activeGoals: [], inventory: [] },
			{ tgoId: 'goal' as TgoId, goal: { requirements: [], workInstances: [workInstance.tgoId] }, inventory: [], },
			workInstance,
			);
		// Is a generator;
		t.truthy(hWI && hWI.next);
	
		// Expect completion after 3 ticks.
		const genDeepEqual = createGenDeepEqual(t, hWI);
	
		// Start execution
		genDeepEqual()();
	
		// Supply the store;
		let transactions;
		transactions = genDeepEqual(
			{ tgos: {
				['worker']: {
					tgoId: 'worker' as TgoId,
				},
				['waitWorkCommittedItems']: {
					...workInstanceCommittedItemsTgo,
					inventory: [{
						typeId: 'tick' as TypeId,
						count: -i,
					}]
				},
			} as TgosState } as unknown as RootStateType as any
		)(undefined, i == (workInstance.workRecipe.actorItemChanges[0].count * -1));

		if (i == (workInstance.workRecipe.actorItemChanges[0].count * -1)) {
			return;
		}
	}
});

test('Work - give reward after taking items', t => {
	const workInstanceCommittedItemsTgo = {
		tgoId: 'tradeWorkCommittedItems' as TgoId,
		inventory: [],
		isInventoryVirtual: true,
	};

	// Create an work instance on 3 tick wait.
	const workInstance: ComponentWork = {
		tgoId: 'tradeWork instance' as TgoId,
		workActorCommittedItemsTgoId: workInstanceCommittedItemsTgo.tgoId,
		workRecipe: {
			actorItemChanges: [
				{
					typeId: 'nutrients' as TypeId,
					count: -10,
				},
				{
					typeId: 'apple' as TypeId,
					count: 1,
				},
			],
			targetItemChanges: [],
			type: 'tradeWork',
		},
	};

	const hWI = handleWorkInstance(
		{ tgoId: 'appleTree' as TgoId, activeGoals: [], inventory: [{
			typeId: 'nutrients' as TypeId,
			count: 50,
		}] },
		{ tgoId: 'goal' as TgoId, goal: { requirements: [], workInstances: [workInstance.tgoId] }, inventory: [], },
		workInstance,
		);
	// Is a generator;
	t.truthy(hWI && hWI.next);
	
	// Expect completion after 3 ticks.
	const genDeepEqual = createGenDeepEqual(t, hWI);
	
	// Start execution
	genDeepEqual()();
	
	// Supply the store;
	const transactions = genDeepEqual(
		{
			tgos: {
				['appleTree']: {
					tgoId: 'appleTree' as TgoId,
					inventory: [{
						typeId: 'nutrients' as TypeId,
						count: 50,
					}]
				},
				['tradeWorkCommittedItems']: {
					...workInstanceCommittedItemsTgo,
				},
			} as TgosState,
			itemTypes: {
				nutrients: {
					typeId: 'nutrients' as TypeId,
					stackable: true,
					positiveOnly: true,
				},
				apple: {
					typeId: 'apple' as TypeId,
					stackable: true,
					positiveOnly: true,
				},
			} as ItemTypesState,
		} as unknown as RootStateType as any
	)(put(transaction(
		{
			tgoId: 'appleTree' as TgoId,
			items: [{
				typeId: 'nutrients' as TypeId,
				count: -10,
			}]
		},
		{
			tgoId: 'tradeWorkCommittedItems' as TgoId,
			items: [{
				typeId: 'nutrients' as TypeId,
				count: -10,
			}]
		}
	)), false);

	genDeepEqual()(undefined, true);

	let hWI2 = handleWorkInstance(
		{ tgoId: 'appleTree' as TgoId, activeGoals: [], inventory: [{
			typeId: 'nutrients' as TypeId,
			count: 40,
		}] },
		{ tgoId: 'goal' as TgoId, goal: { requirements: [], workInstances: [workInstance.tgoId] }, inventory: [], },
		workInstance,
		);
	// Is a generator;
	t.truthy(hWI2 && hWI2.next);
	
	// Expect completion after 3 ticks.
	const genDeepEqual2 = createGenDeepEqual(t, hWI2);
	
	// Start execution
	genDeepEqual2()();

	// Supply the store;
	const transactions2 = genDeepEqual2(
		{
			tgos: {
				['appleTree']: {
					tgoId: 'appleTree' as TgoId,
					inventory: [{
						typeId: 'nutrients' as TypeId,
						count: 40,
					}]
				},
				['tradeWorkCommittedItems']: {
					...workInstanceCommittedItemsTgo,
					inventory: [{
						typeId: 'nutrients' as TypeId,
						count: -10,
					}]
				},
			} as TgosState,
			itemTypes: {
				nutrients: {
					typeId: 'nutrients' as TypeId,
					stackable: true,
					positiveOnly: true,
				},
				apple: {
					typeId: 'apple' as TypeId,
					stackable: true,
					positiveOnly: true,
				},
			} as ItemTypesState,
		} as unknown as RootStateType as any
	)(put(transaction(
		{
			tgoId: 'appleTree' as TgoId,
			items: [{
				typeId: 'apple' as TypeId,
				count: 1,
			}]
		}
	)), false);

	genDeepEqual2()([{
		tgoId: 'appleTree' as TgoId,
		awardItems: [{
			typeId: 'apple' as TypeId,
			count: 1,
		}]
	}], true);
});

test.todo('Work - have two actors commit items');

test.todo('Work - Deletes both the committedRequiredItems and committedAwerdedItems objects after completion');
