import util from 'util';
import { default as test, DeepEqualAssertion, ExecutionContext } from 'ava';
import { expectSaga } from 'redux-saga-test-plan';
import sinon from 'sinon';
import { createWork, handleCreateWork, handleWork } from '../concerns/work';
import { consume } from '../data/recipes';
import { TgoId, TgoType } from '../reducers/tgo';
import { getType } from 'typesafe-actions';
import { select, put, PutEffect, PutEffectDescriptor, takeEvery } from 'redux-saga/effects';
import rootReducer, { RootStateType } from '../reducers';
import { omitType, omitMetaAndError, overrideTgoWithId, overrideAddTgoActionWithId } from '../testUtils';
import { TypeId } from '../reducers/itemType';
import { ItemTypesState } from '../reducers/itemTypes';
import { TgosState } from '../reducers/tgos';
import { add as addTgo } from '../actions/tgos';
import { addTgoId as inventoryAddTgoId, ComponentInventory } from '../components/inventory';
import { addWork as goalAddWork, removeWork, addGoals, createGoal } from '../concerns/goal';
import { ComponentWork, ComponentGoal, ComponentWorkDoer } from '../data/components_new';
import { Recipe, RecipeId } from '../reducers/recipe';
import rootSaga from '../sagas/root';
import { tick } from '../actions/ticker';
import { selectTgo } from '../concerns/tgos';
import { add as itemTypeAdd } from '../actions/itemTypes';

// Test work

util.inspect.defaultOptions.depth = 500;  

test('Create a work without errors', t => {
	const params = {
		goalTgoId: 'Temp goal id' as TgoId,
		targetTgoId: 'Target id' as TgoId,
		recipe: consume,
	};

	t.notThrows(() => createWork(params));
});

test('Test work - handleCreateWork - fail if goalTgoId not in store', t => {
	const params = {
		goalTgoId: 'Temp goal id' as TgoId,
		targetTgoId: 'Target id' as TgoId,
		recipe: consume,
	};

	const wSaga = handleCreateWork(createWork(params));

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

	const wSaga = handleCreateWork(createWork(params));

	t.deepEqual(
		wSaga.next().value,
		select()
	);

	const goalTgo: TgoType & ComponentGoal = {
		tgoId: 'Temp goal id' as TgoId,
		goal: {
			requirements: [],
			workTgoIds: [],
		},
	};

	const wSagaAddTgoPut = wSaga.next({ tgos: {
		[goalTgo.tgoId]: goalTgo,
	} as TgosState } as unknown as RootStateType as any).value;

	type AddTgoType = ReturnType<typeof addTgo>;

	const isPutEffect = (a: any): a is PutEffect => a && a.type === 'PUT';
	const isAddAction = (a: any): a is AddTgoType => a && a.type === getType(addTgo);
	const isInventoryAddTgoIdAction = (a: any): a is ReturnType<typeof inventoryAddTgoId> => a && a.type === getType(inventoryAddTgoId);
	const isGoalAddWorkAction = (a: any): a is ReturnType<typeof goalAddWork> => a && a.type === getType(goalAddWork);

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
	const workAdd = wSaga.next().value;
	if (!isPutEffect(workAdd) || !isGoalAddWorkAction(workAdd.payload.action)) {
		t.fail();
		return;
	}
	// t.deepEqual(
	// 	workAdd,
	// 	put(goalAddWork('Temp goal id' as TgoId, wSagaAddWorkTgoPut.payload.action.payload.tgo.tgoId))
	// )
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
	// Create an empty work.
	const work: ComponentWork = {
		tgoId: 'emptyWork' as TgoId,
		workRecipe: {
			input: [],
			output: [],
			type: 'emptyWork' as RecipeId,
		},
	};

	// Run empty work.
	const hWI = handleWork(
		{ tgoId: 'worker' as TgoId, recipeInfos: [], inventory: [] },
		work,
		{ tgoId: 'goal' as TgoId, goal: { requirements: [], workTgoIds: [work.tgoId] }, inventory: [], },
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
	const workCommittedItemsTgo = {
		tgoId: 'waitWorkCommittedItems' as TgoId,
		inventory: [],
		isInventoryVirtual: true,
	};

	// Create an work on 3 tick wait.
	const work: ComponentWork = {
		tgoId: 'waitWork' as TgoId,
		workActorCommittedItemsTgoId: workCommittedItemsTgo.tgoId,
		workRecipe: {
			input: [{
				typeId: 'tick' as TypeId,
				count: -3,
			}],
			output: [],
			type: 'waitWork' as RecipeId,
		},
	};

	for (let i = 0; i < 5; i++) {
		let hWI = handleWork(
			{ tgoId: 'worker' as TgoId, recipeInfos: [], inventory: [] },
			work,
			{ tgoId: 'goal' as TgoId, goal: { requirements: [], workTgoIds: [work.tgoId] }, inventory: [], },
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
					...workCommittedItemsTgo,
					inventory: [{
						typeId: 'tick' as TypeId,
						count: -i,
					}]
				},
			} as TgosState } as unknown as RootStateType as any
		)(undefined, i == (work.workRecipe.input[0].count * -1));

		if (i == (work.workRecipe.input[0].count * -1)) {
			return;
		}
	}
});

const wrappedRootSaga = function* () {
	yield* rootSaga();
	yield takeEvery('*', function* () {});
}

const setupRedux = expectSaga(wrappedRootSaga)
	.withReducer(rootReducer);

test('Work - simple actor item change', async t => {
	const recipe: Recipe = {
		input: [{
			typeId: 'coal' as TypeId,
			count: -10,
		}],
		output: [],
		type: 'furnace' as RecipeId,
	};

	const createActor = addTgo({
		inventory: [{
			typeId: 'coal' as TypeId,
			count: 20,
		}],
		recipeInfos: [{
			autoRun: false,
			recipe,
		}],
	});
	const actorTgoId = createActor.payload.tgo.tgoId;

	const { storeState } = await setupRedux
		.dispatch(itemTypeAdd({
			typeId: 'coal' as TypeId,
			stackable: true,
			positiveOnly: true,
		}))
		.dispatch(createActor)
		.dispatch(createWork({
			goalTgoId: '' as TgoId,
			recipe,
			targetTgoId: actorTgoId,
		}))
		.dispatch(tick())
		.silentRun(0);

	t.deepEqual(selectTgo(storeState, actorTgoId)?.inventory?.find(({ typeId }) => typeId === 'coal' as TypeId),
		{
			typeId: 'coal' as TypeId,
			count: 10,
		},
	);
});

// test('Work - simple target item change', t => {
// 	const work = {
// 		actorItemChanges: [],
// 		targetItemChanges: [{
// 			typeId: 'entropy' as TypeId,
// 			count: 5,
// 		}],
// 		type: 'anyWork',
// 	};

// 	const hWI = handleWork(
// 		{ tgoId: 'appleTree' as TgoId, inventory: [{
// 			typeId: 'nutrients' as TypeId,
// 			count: 50,
// 		}] },
// 		work,
// 		{ tgoId: 'goal' as TgoId, goal: { requirements: [], workTgoIds: [work.tgoId] }, inventory: [], },
// 		);
// 	// Is a generator;
// 	t.truthy(hWI && hWI.next);
	
// 	// Expect completion after 3 ticks.
// 	const genDeepEqual = createGenDeepEqual(t, hWI);
	
// 	// Start execution
// 	genDeepEqual()();
	
// 	// Supply the store;
// 	const transactions = genDeepEqual(
// 		{
// 			tgos: {
// 				['appleTree']: {
// 					tgoId: 'appleTree' as TgoId,
// 					inventory: [{
// 						typeId: 'nutrients' as TypeId,
// 						count: 50,
// 					}]
// 				},
// 				['tradeWorkCommittedItems']: {
// 					...workInstanceCommittedItemsTgo,
// 				},
// 			} as TgosState,
// 			itemTypes: {
// 				nutrients: {
// 					typeId: 'nutrients' as TypeId,
// 					stackable: true,
// 					positiveOnly: true,
// 				},
// 				apple: {
// 					typeId: 'apple' as TypeId,
// 					stackable: true,
// 					positiveOnly: true,
// 				},
// 			} as ItemTypesState,
// 		} as unknown as RootStateType as any
// 	)(put(transaction(
// 		{
// 			tgoId: 'appleTree' as TgoId,
// 			items: [{
// 				typeId: 'nutrients' as TypeId,
// 				count: -10,
// 			}]
// 		},
// 		{
// 			tgoId: 'tradeWorkCommittedItems' as TgoId,
// 			items: [{
// 				typeId: 'nutrients' as TypeId,
// 				count: -10,
// 			}]
// 		}
// 	)), false);

// 	genDeepEqual()(undefined, true);
// // test('Work - same item type in actor and target', t => {
// 	// This requires two inventories for work.

// 	let hWI2 = handleWork(
// 		{ tgoId: 'appleTree' as TgoId, activeGoals: [], inventory: [{
// 			typeId: 'nutrients' as TypeId,
// 			count: 40,
// 		}] },
// 		{ tgoId: 'goal' as TgoId, goal: { requirements: [], workTgoIds: [workInstance.tgoId] }, inventory: [], },
// 		workInstance,
// 		);
// 	// Is a generator;
// 	t.truthy(hWI2 && hWI2.next);
	
// 	// Expect completion after 3 ticks.
// 	const genDeepEqual2 = createGenDeepEqual(t, hWI2);
	
// 	// Start execution
// 	genDeepEqual2()();

// 	// Supply the store;
// 	const transactions2 = genDeepEqual2(
// 		{
// 			tgos: {
// 				['appleTree']: {
// 					tgoId: 'appleTree' as TgoId,
// 					inventory: [{
// 						typeId: 'nutrients' as TypeId,
// 						count: 40,
// 					}]
// 				},
// 				['tradeWorkCommittedItems']: {
// 					...workInstanceCommittedItemsTgo,
// 					inventory: [{
// 						typeId: 'nutrients' as TypeId,
// 						count: -10,
// 					}]
// 				},
// 			} as TgosState,
// 			itemTypes: {
// 				nutrients: {
// 					typeId: 'nutrients' as TypeId,
// 					stackable: true,
// 					positiveOnly: true,
// 				},
// 				apple: {
// 					typeId: 'apple' as TypeId,
// 					stackable: true,
// 					positiveOnly: true,
// 				},
// 			} as ItemTypesState,
// 		} as unknown as RootStateType as any
// 	)(put(transaction(
// 		{
// 			tgoId: 'appleTree' as TgoId,
// 			items: [{
// 				typeId: 'apple' as TypeId,
// 				count: 1,
// 			}]
// 		}
// 	)), false);

// 	genDeepEqual2()([{
// 		tgoId: 'appleTree' as TgoId,
// 		awardItems: [{
// 			typeId: 'apple' as TypeId,
// 			count: 1,
// 		}]
// 	}], true);
// });

test.todo('Work - have two actors commit items');

test.todo('Work - Deletes both the committedRequiredItems and committedAwerdedItems objects after completion');

test('Work - hierarchy', async t => {
	const upperBodyTgo: ComponentWorkDoer = {
		tgoId: 'upperBody' as TgoId,
		recipeInfos: [{
			autoRun: false,
			recipe: {
				type: 'strengthToolUse' as RecipeId,
				input: [
					{
						typeId: 'energy' as TypeId,
						count: -5,
					},
					{
						typeId: 'tick' as TypeId,
						count: -1,
					},
				],
				output: [{
					typeId: 'strengthToolUse' as TypeId,
					count: 1,
				}],
			},
		}],
	};

	const handMill: ComponentWorkDoer = {
		tgoId: 'handMill' as TgoId,
		recipeInfos: [{
			autoRun: false,
			recipe: {
				type: 'milling' as RecipeId,
				input: [
					{
						typeId: 'grain' as TypeId,
						count: -1,
					},
					{
						typeId: 'strengthToolUse' as TypeId,
						count: -2,
					},
				],
				output: [{
					typeId: 'flour' as TypeId,
					count: 1,
				}],
			},
		}],
	}

	const playerTgo: ComponentInventory = {
		tgoId: 'player' as TgoId,
		inventory: [
			{
				tgoId: upperBodyTgo.tgoId,
				typeId: 'tgoId' as TypeId,
				count: 1,
			},
			{
				typeId: 'energy' as TypeId,
				count: 50,
			},
			{
				tgoId: handMill.tgoId,
				typeId: 'tgoId' as TypeId,
				count: 1,
			},
			{
				typeId: 'grain' as TypeId,
				count: 3,
			},
		],
	};
	const createPlayerTgo = addTgo(playerTgo);

	const createGoalAction = createGoal(
		createPlayerTgo.payload.tgo.tgoId,
		{
			requirements: [{
				type: 'RequirementInventoryItems',
				inventoryItems: [{
					typeId: 'flour' as TypeId,
					count: 3,
				}],
			}],
			workTgoIds: [],
		}
	);

	const { storeState } = await setupRedux
		.dispatch(createPlayerTgo)
		// .dispatch(addGoals(createPlayerTgo.payload.tgo.tgoId, [{

		// }]))
		.dispatch(createGoalAction)
		.dispatch(tick())
		.dispatch(tick())
		.dispatch(tick())
		.silentRun(0);
	
	console.log('inv: ', selectTgo(storeState, createPlayerTgo.payload.tgo.tgoId)?.inventory);
	t.deepEqual(selectTgo(storeState, createPlayerTgo.payload.tgo.tgoId)?.inventory,
		[
			{
				tgoId: upperBodyTgo.tgoId,
				typeId: 'tgoId' as TypeId,
				count: 1,
			},
			{
				typeId: 'energy' as TypeId,
				count: 35,
			},
			{
				tgoId: handMill.tgoId,
				typeId: 'tgoId' as TypeId,
				count: 1,
			},
			{
				typeId: 'grain' as TypeId,
				count: 0,
			},
			{
				typeId: 'flour' as TypeId,
				count: 3,
			},
		],
	);
});
