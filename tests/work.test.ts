import util from 'util';
import { default as test, DeepEqualAssertion, ExecutionContext } from 'ava';
import Sinon from 'sinon';
import { createWork } from '../concerns/work.js';
import { consume } from '../data/recipes.js';
import { TgoId } from '../reducers/tgo.js';
import { getType, Action } from 'typesafe-actions';
import { RootStateType } from '../reducers/index.js';
import { TypeId } from '../reducers/itemType.js';
import { TgosState } from '../reducers/tgos.js';
import { add as addTgo } from '../actions/tgos.js';
import { addTgoId as inventoryAddTgoId, ComponentInventory } from '../concerns/inventory.js';
import { addGoals, createGoal } from '../concerns/goal.js';
import { ComponentWork, ComponentWorkDoer, hasComponentWorkDoer } from '../concerns/work.js';
import { Recipe, RecipeId } from '../concerns/recipe.js';
import { tick } from '../concerns/ticker.js';
import { selectTgo } from '../concerns/tgos.js';
import { add as itemTypeAdd } from '../actions/itemTypes.js';
import { items, createItemTypeAction } from '../data/types.js';
import { setupStoreTester } from '../testUtils.js';

test.afterEach(() => {
	Sinon.restore();
})

// Test work

util.inspect.defaultOptions.depth = 500;  

const addTgoWithId = (...params: Parameters<typeof addTgo>): [ReturnType<typeof addTgo>, TgoId]  => {
	const addTgoAction = addTgo(...params);
	return [addTgoAction, addTgoAction.payload.tgo.tgoId];
};

test('Test work - fail if workerTgoId not in store', async t => {
	const workAction = createWork({
		recipe: consume,
		workerTgoId: 'illegalId' as TgoId,
		inputInventoryTgoIds: ['illegalId' as TgoId],
		outputInventoryTgoId: undefined,
		workIssuerTgoId: undefined,
	});

//	const errorStub = Sinon.createStubInstance(Error);

	const errorStub = Sinon.stub(console, 'error');

	const storeTester = setupStoreTester();
	storeTester.dispatch(workAction);
	t.deepEqual(
		selectTgo(storeTester.getState(), 'illegalId' as TgoId),
		undefined
	)

//	t.assert(errorStub);

	t.assert(errorStub.calledOnce);
});

test('Test work - fail if targetTgoId not in store', async t => {
	// Should this fail?
	// * Currently it should fail.
	// - HandleCreateWork saga relies on it.
	// - It might make coding easier if it doesn't.
	// - Code might be refactored that only the tick phase / possible prepare phase requires it.

	// Shoud it throw or fail silently?
	// * Currently it should throw.
	// ! BUT throwing will restart the takeEvery and instead puts an action.
	// - createWork should only be triggered by the server and never sent by the client - It's an exception!

	const [createWorker, workerTgoId] = addTgoWithId({  });

	const workAction = createWork({
		recipe: consume,
		workerTgoId: workerTgoId,
		inputInventoryTgoIds: [workerTgoId],
		outputInventoryTgoId: 'illegalId' as TgoId,
		workIssuerTgoId: undefined,
	});

	const errorStub = Sinon.stub(console, 'error');

	const storeTester = setupStoreTester();
	storeTester.dispatch(createWorker);
	storeTester.dispatch(workAction);
	// t.deepEqual(storeTester.getCalledActions(), [
	// 	createWorker,
	// 	workAction,
	// 	wrapEveryErrorReportAction({
	// 		actionPattern: getType(createWork),
	// 		workerName: 'handleCreateWork',
	// 		error: new Error('Tgo matching outputInventoryTgoId in handleCreateWork not found!'),
	// 	})
	// ]);

	t.assert(errorStub.calledOnce);
});

test.failing('Test work - creation - fail if goalTgoId not in store', async t => {
	// Possibly remove goalTgoId from work.
	t.plan(0);

	const createTarget = addTgo({
	});

	const workAction = createWork({
		recipe: consume,
		workerTgoId: 'illegalId' as TgoId,
		inputInventoryTgoIds: ['illegalId' as TgoId],
		outputInventoryTgoId: createTarget.payload.tgo.tgoId,
		workIssuerTgoId: 'illegalId' as TgoId,
	});

	const errorStub = Sinon.stub(console, 'error');

	const storeTester = setupStoreTester();
	storeTester.dispatch(workAction);
	// t.deepEqual(storeTester.getCalledActions(), [
	// 	workAction,
	// 	wrapEveryErrorReportAction({
	// 		actionPattern: getType(createWork),
	// 		workerName: 'handleCreateWork',
	// 		error: new Error('Tgo matching goalTgoId in handleCreateWork not found!'),
	// 	})
	// ]);

	t.assert(errorStub.calledOnce);
});

test('Work - work is removed after completion', async t => {
	const [createWorker, workerTgoId] = addTgoWithId({ recipeInfos: [] });
	const workAction = createWork({
		recipe: {
			input: [],
			output: [],
			type: 'emptyWork' as RecipeId,
		},
		workerTgoId: workerTgoId,
		inputInventoryTgoIds: [workerTgoId],
		workIssuerTgoId: undefined,
	});

	const storeTester = setupStoreTester();
	storeTester.dispatch(createWorker);
	storeTester.dispatch(workAction);
	storeTester.dispatch(tick());

	t.deepEqual(storeTester.getState().tgos[workerTgoId].inventory, []);
});

test('Work - wait 3 ticks', async t => {
	const threeTickRecipe = {
		input: [{
			typeId: 'tick' as TypeId,
			count: 3,
		}],
		output: [],
		type: 'waitWork' as RecipeId,
	};

	const [addWorker, workerTgoId] = addTgoWithId({
		recipeInfos: [{ // becomes a workDoer
			recipe: threeTickRecipe,
			autoRun: 'Always',
		}],
	});

	// Create an work on 3 tick wait.

	const workAction = createWork({
		recipe: threeTickRecipe,
		workerTgoId: workerTgoId,
		inputInventoryTgoIds: [workerTgoId],
		outputInventoryTgoId: workerTgoId,
		workIssuerTgoId: undefined,
	});

	const storeTester = setupStoreTester();
	storeTester.dispatch(createItemTypeAction('tick', items['tick']));
	storeTester.dispatch(addWorker);
	storeTester.dispatch(workAction);
	storeTester.dispatch(tick());
	storeTester.dispatch(tick());
	// Work should still remain.
	t.notDeepEqual(storeTester.getState().tgos[workerTgoId].inventory, []);
	storeTester.dispatch(tick());
	
	// Work should delete itself from worker inventory.
	t.deepEqual(storeTester.getState().tgos[workerTgoId].inventory, []);
	t.true(Object.keys(storeTester.getState().tgos).length === 1); // Only the initial worker TgoId remains.
});

test('Work - simple item change', async t => {
	const recipe: Recipe = {
		input: [{
			typeId: 'coal' as TypeId,
			count: 10,
		}],
		output: [{
			typeId: 'heat' as TypeId,
			count: 3,
		}],
		type: 'furnace' as RecipeId,
	};

	const [createWorkDoer, workDoerTgoId] = addTgoWithId({
		inventory: [{
			typeId: 'coal' as TypeId,
			count: 22,
		}],
		recipeInfos: [{
			autoRun: 'OnDemand',
			recipe,
		}],
	});

	const storeTester = setupStoreTester();
	storeTester.dispatch(itemTypeAdd({
		typeId: 'coal' as TypeId,
		stackable: true,
		// positiveOnly: true,
	}));
	storeTester.dispatch(itemTypeAdd({
		typeId: 'heat' as TypeId,
		stackable: true,
		// positiveOnly: true,
	}));
	storeTester.dispatch(createWorkDoer);
	storeTester.dispatch(createWork({
		recipe,
		workerTgoId: workDoerTgoId,
		inputInventoryTgoIds: [workDoerTgoId],
		outputInventoryTgoId: workDoerTgoId,
		workIssuerTgoId: undefined,
	}));
	storeTester.dispatch(tick());
	storeTester.dispatch(tick());

	t.deepEqual(selectTgo(storeTester.getState(), workDoerTgoId)?.inventory,
		[
			{
				typeId: 'coal' as TypeId,
				count: 12,
			},
			{
				typeId: 'heat' as TypeId,
				count: 3,
			},
		]
	);
});

test('Work - autorunning works', t => {
	const [appleTreeCreateAction, appleTreeTgoId] = addTgoWithId({
		inventory: [{
			typeId: 'nutrients' as TypeId,
			count: 50,
		}],
		recipeInfos: [{
			autoRun: 'OnInputs',
			recipe: {
				input: [{
					typeId: 'nutrients' as TypeId,
					count: 10,
				}],
				output: [{
					typeId: 'apple' as TypeId,
					count: 1,
				}],
				type: 'appleGrower' as RecipeId,
			},
		}],
	});

	const storeTester = setupStoreTester();
	storeTester.dispatch(appleTreeCreateAction);

	storeTester.dispatch(itemTypeAdd({
		typeId: 'nutrients' as TypeId,
		stackable: true,
		positiveOnly: true,
	}));

	storeTester.dispatch(itemTypeAdd({
		typeId: 'apple' as TypeId,
		stackable: true,
		positiveOnly: true,
	}));
	storeTester.dispatch(tick()); // Tick creates the works from auto recipes.

	t.deepEqual(storeTester.getState().tgos[appleTreeTgoId]?.inventory, [
		{
			typeId: 'nutrients' as TypeId,
			count: 40,
		},
		{
			typeId: 'apple' as TypeId,
			count: 1,
		},
	]);
	t.true(Object.keys(storeTester.getState().tgos).length === 1); // Only the initial worker TgoId remains.

	storeTester.dispatch(tick()); // Tick creates the works from auto recipes.
	storeTester.dispatch(tick()); // Tick creates the works from auto recipes.
	storeTester.dispatch(tick()); // Tick creates the works from auto recipes.
	storeTester.dispatch(tick()); // Tick creates the works from auto recipes.

	t.deepEqual(storeTester.getState().tgos[appleTreeTgoId]?.inventory, [
		{
			typeId: 'nutrients' as TypeId,
			count: 0,
		},
		{
			typeId: 'apple' as TypeId,
			count: 5,
		},
	]);
	t.true(Object.keys(storeTester.getState().tgos).length === 1); // Only the initial worker TgoId remains.

	storeTester.dispatch(tick()); // Tick creates the works from auto recipes.
	t.deepEqual(storeTester.getState().tgos[appleTreeTgoId]?.inventory?.find(({ typeId }) => typeId === 'nutrients' as TypeId), {
		typeId: 'nutrients' as TypeId,
		count: 0,
	});
	t.deepEqual(storeTester.getState().tgos[appleTreeTgoId]?.inventory?.find(({ typeId }) => typeId === 'apple' as TypeId), {
		typeId: 'apple' as TypeId,
		count: 5,
	});
	t.true(Object.keys(storeTester.getState().tgos).length === 3); // The initial worker, incomplete work and committedInventory

	storeTester.dispatch(tick()); // Tick creates the works from auto recipes.
	t.deepEqual(storeTester.getState().tgos[appleTreeTgoId]?.inventory?.find(({ typeId }) => typeId === 'nutrients' as TypeId), {
		typeId: 'nutrients' as TypeId,
		count: 0,
	});
	t.deepEqual(storeTester.getState().tgos[appleTreeTgoId]?.inventory?.find(({ typeId }) => typeId === 'apple' as TypeId), {
		typeId: 'apple' as TypeId,
		count: 5,
	});
	t.true(Object.keys(storeTester.getState().tgos).length === 3); // No additional tgos for works etc. are made.
});

test.todo('Work - work with multiple input inventories');

test.todo('Work - Deletes both the committedRequiredItems and committedAwerdedItems objects after completion');

test.todo('Work - cancelling redeems correctly');

test('Work - hierarchy', async t => {
	const upperBodyTgo: ComponentWorkDoer = {
		tgoId: 'upperBody' as TgoId,
		recipeInfos: [{
			autoRun: 'OnDemand',
			recipe: {
				type: 'strengthToolUse' as RecipeId,
				input: [
					{
						typeId: 'energy' as TypeId,
						count: 5,
					},
					{
						typeId: 'tick' as TypeId,
						count: 1,
					},
				],
				output: [{
					typeId: 'strengthToolUse' as TypeId,
					count: 1,
				}],
			},
		}],
		worksIssued: [],
	};

	const handMill: ComponentWorkDoer = {
		tgoId: 'handMill' as TgoId,
		recipeInfos: [{
			autoRun: 'OnDemand',
			recipe: {
				type: 'milling' as RecipeId,
				input: [
					{
						typeId: 'grain' as TypeId,
						count: 1,
					},
					{
						typeId: 'strengthToolUse' as TypeId,
						count: 2,
					},
				],
				output: [{
					typeId: 'flour' as TypeId,
					count: 1,
				}],
			},
		}],
		worksIssued: [],
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
		}
	);


	const storeTester = setupStoreTester();
	storeTester.dispatch(createPlayerTgo);
	// .dispatch(addGoals(createPlayerTgo.payload.tgo.tgoId, [{

	// }]))
	storeTester.dispatch(createGoalAction);
	storeTester.dispatch(tick());
	storeTester.dispatch(tick());
	storeTester.dispatch(tick());
	storeTester.dispatch(tick());
	storeTester.dispatch(tick());
	storeTester.dispatch(tick());
	storeTester.dispatch(tick());
	storeTester.dispatch(tick());
	storeTester.dispatch(tick());
	
	console.log('inv: ', selectTgo(storeTester.getState(), createPlayerTgo.payload.tgo.tgoId)?.inventory);
	t.deepEqual(selectTgo(storeTester.getState(), createPlayerTgo.payload.tgo.tgoId)?.inventory,
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
