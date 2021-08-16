import { put, all, takeEvery, call } from 'typed-redux-saga';
import { ActionType, createAction, getType } from 'typesafe-actions';

import { Recipe } from '../reducers/recipe.js';
import { TgoId, TgoType, TgoRoot } from '../reducers/tgo.js';
import { Inventory, addTgoId as inventoryAddTgoId, ComponentInventory, hasComponentInventory, removeTgoId, InventoryItem } from './inventory.js';
import { transaction } from '../concerns/transaction.js';
import { RootStateType } from '../reducers/index.js';
import { add as addTgo, remove as removeTgo } from '../actions/tgos.js';
import { addWork as goalAddWork, removeWork } from '../concerns/goal.js';
import isServer from '../isServer.js';
import { TypeId } from '../reducers/itemType.js';
import { getTgoByIdFromRootState } from '../reducers/tgos.js';
import { tick } from '../concerns/ticker.js';
import { selectTgo } from './tgos.js';
import { tryWrapTakeEvery } from '../sagas/sagaHelper.js';
import { select } from '../redux-saga-helpers.js';

// Actions:

export const createFromRecipe = createAction('WORK_CREATE_FROM_RECIPE',
	({ recipe }: { recipe: Recipe }) => ({
		recipe,
	})
)();

export const createWork = createAction('WORK_CREATE',
	({
		recipe,
		workerTgoId,
		inputInventoryTgoIds,
		outputInventoryTgoId,
		goalTgoId,
	}: {
		recipe: Recipe,
		workerTgoId?: TgoId,
		inputInventoryTgoIds: ReadonlyArray<TgoId>,
		outputInventoryTgoId?: TgoId
		goalTgoId?: TgoId,
	}) => ({
		recipe,
		workerTgoId,
		inputInventoryTgoIds,
		outputInventoryTgoId,
		goalTgoId,
	})
)();

export const workActions = {
	createWork,
	createFromRecipe,
};
export type WorkActionType = ActionType<typeof workActions>;

// Work TGO members:

export type ComponentWork = 
	TgoRoot & {
		// A work is a recipe in progress. There's a separate tgoId for each work. A work must (currently) be in an inventory.
		// Worker is the tgo in whose inventory this work is.
		readonly workRecipe: Recipe,
		readonly workInputInventoryTgoIds: ReadonlyArray<TgoId>,
		readonly workOutputInventoryTgoId?: TgoId,
		// readonly workInputCommittedItemsTgoId?: Record<TgoId, TgoId>, // Committed items are already removed from input inventory, but can be redeemed.
		readonly workInputCommittedItemsTgoId?: Record<string, TgoId>, // Committed items are already removed from input inventory, but can be redeemed.
		// readonly workTargetCommittedItemsTgoId?: TgoId, // Committed items are already removed from target's inventory, but can be redeemed.
	};

export const isComponentWork = <BaseT extends TgoType | ComponentWork>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWork>) =>
	tgo && typeof tgo.workRecipe !== 'undefined';

export type ComponentWorkDoer = 
	TgoRoot & {
		// readonly recipeInfos: Record<RecipeId, {
		readonly recipeInfos: ReadonlyArray<{
			readonly recipe: Recipe,
			readonly autoRun: boolean,
	//		readonly workProgress?: TgoId, // Tgo with inventory.
		}>,
	};

export const hasComponentWorkDoer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWorkDoer>) =>
	tgo && (tgo.recipeInfos !== undefined)
	
// Reducer:

// Sagas:


// Start with work that only requires ticks.

// work is the goal
// work will advance with Transactions
// work has an inventory
// work has an tgoId (because of inventory)

// since work has an tgoId, does it have other components?
//   - I guess no.

// should work be in the owner's inventory?

// Most of the above also applies to goals.


// Actor is a tgo that has an inventoryitems of goals that have their own inventory items with works inside that have inventory.

// const advanceWorkWithInput = function* ({work, actorTgoId, input}: {work: Work, actorTgoId: TgoId, input: InventoryItem}) {

// }



// Steps:
//
// Actor has a Goal (get to position)
//   something recognises that we need position changes to complete it.
// Actor searches his works how to generate position changes.
// Actor creates a new work to the goal (Where?)
// Actor repeats below until work is complete.
//   Actor pushes (all) inventory to work through transactions.
//   Actor can also push one tick to work through transaction.
// On completion, actor collects the output from work.
// 







// {
// 	if (input.typeId === 'tick') {
// 		if (input.count <= 0)
// 			return true;
// 		const getCurrentTick = function*() { return ((yield* select()) as RootStateType).ticker.currentTick; }
// 		const endTick = (yield getCurrentTick()) + input.count;
// 		while (yield getCurrentTick() < endTick) {
// 			yield false;
// 		}
// 		return true;
// 	} else {
// 		const s= yield* select();
// 		const actorTgo = s.tgos[actorTgoId];
// 		if (!hasComponentInventory(actorTgo)) {
// 			return false;
// 		}

// 		return (actorTgo.inventory.some(i => (i.typeId === input.typeId) && (i.count >= input.count)));
// 	}
// }

const checkWorkCompletion = function* (workTgoId: TgoId) {
	const s= yield* select();
	const workTgo = s.tgos[workTgoId];
	if (!isComponentWork(workTgo)) return undefined; // Fail
	if (workTgo.workRecipe.input.length == 0) return true;
	if (!hasComponentInventory(workTgo)) return false;

	return (workTgo.workRecipe.input.every(input => {
		const foundProgressItem = workTgo.inventory.find(progress => progress.typeId === input.typeId);
		return ((foundProgressItem !== undefined) && (foundProgressItem.count >= input.count));
	}));
}

export type WorkOutput = Array<{
	tgoId: TgoId,
	awardItems: Inventory,
}> | undefined;

export const handleWork = function* (
	workDoerTgo: ComponentWorkDoer & Partial<ComponentInventory>,
	workTgo: ComponentWork & Partial<ComponentInventory>,
) {
	if (!hasComponentWorkDoer(workDoerTgo)
		|| !isComponentWork(workTgo)){
		return 'error'; // Fail
	}

	const s= yield* select();
	const getTgoById = getTgoByIdFromRootState(s.tgos);

	const participants = workTgo.workInputInventoryTgoIds
		.map(workInputInventoryTgoId =>s.tgos[workInputInventoryTgoId])
		.map(workInputInventoryTgo => ({
			tgo: workInputInventoryTgo,
			committedItems: getTgoById(workTgo.workInputCommittedItemsTgoId[workInputInventoryTgo.tgoId])?.inventory ?? [],
			itemsChange: workTgo.workRecipe.input,
		}));

	const missingInput = workTgo.workRecipe.input
		.map(ii => ({
			...ii,
			count: ii.count - participants
				.map(participant =>
					participant.committedItems.find(({ typeId: committedTypeId }) => committedTypeId == ii.typeId)?.count ?? 0
				).reduce((sum, current) => sum + current, 0),
			})
		)
		.filter(ii => ii.count !== 0);

	const participantsWithCommitables = participants
		.map(participant => ({
			...participant,
			committableRequiredInventoryTypes: missingInput
				.map(requiredItem => requiredItem.typeId)
				.filter(typeId =>
					typeId !== 'tick' &&
					participant.tgo.inventory?.some(pii => pii.typeId === typeId)
				)
		}))
		.map(participant => ({
			...participant,
			committableRequiredItems: [
				...participant
					.committableRequiredInventoryTypes.map(typeId => ({
						typeId,
						count: participant.tgo.inventory?.find(ii => ii.typeId === typeId)?.count ?? 0
					})),
			]
			.filter(items => items.count > 0) // Don't add 0 counts to transactions.
		}));

	const participantsWithCommitablesWithTickSource: Array<{ tgoId: TgoId, committableRequiredItems: (typeof participantsWithCommitables)[0]['committableRequiredItems'] }> = [
		...participantsWithCommitables.map(participant => ({
			tgoId: participant.tgo.tgoId,
			committableRequiredItems: participant.committableRequiredItems,
		})),
		...missingInput.some(mii => mii.typeId === 'tick')
			? [{
				tgoId: '' as TgoId, // '' so we can discard this from the transaction.
				committableRequiredItems: [{ typeId: 'tick' as TypeId, count: 1 }],
			}]
			: [],
	].filter(({ committableRequiredItems }) => committableRequiredItems.length > 0);

	const [missedRequiredItems, participantWithItemsToCommit] = participantsWithCommitablesWithTickSource
		.reduce<[Inventory, Array<{ tgoId: TgoId, itemsToCommit: Inventory }>]>(
			([currentMissingItems, participantItemsToCommit], participant) => {
				const currentParticipantItemsToCommit = ({
					tgoId: participant.tgoId,
					itemsToCommit: currentMissingItems.map<InventoryItem>(
						missingItem => ({
							typeId: missingItem.typeId,
							count: Math.min(
								missingItem.count,
								participant.committableRequiredItems
									.find(participantItem => participantItem.typeId === missingItem.typeId)?.count ?? 0
							),
						})
					).filter(committingItem => committingItem.count > 0)
				});
				return [
					currentMissingItems.map(currentMissingItem => ({
						typeId: currentMissingItem.typeId,
						count: currentMissingItem.count - (currentParticipantItemsToCommit.itemsToCommit
							.find(participantItem => participantItem.typeId === currentMissingItem.typeId)?.count ?? 0),
					})).filter(({ count }) => count > 0),
					[...participantItemsToCommit, currentParticipantItemsToCommit]
				];
			},
			[missingInput, []]
		);

	const mangledCommittables = participantWithItemsToCommit
		.map(p => [
			...p.tgoId // Skip the tick source.
				? [{ // Remove items from participant.
					tgoId: p.tgoId,
					items: p.itemsToCommit
						// .filter(ri => ri.typeId !== 'tick')
						.map(ii => ({ ...ii, count: -1 * ii.count })),
				}]
				: [],
			...workTgo.workInputCommittedItemsTgoId[p.tgoId]
				? [{ // Add items to committed items.
					tgoId: workTgo.workInputCommittedItemsTgoId[p.tgoId],
					items: p.itemsToCommit
				}]
				: [],
		]).flat();
	
	if (mangledCommittables.length > 0) {
		const reqTransaction = transaction(...mangledCommittables);
		yield* put(reqTransaction);
	}

	const allRequirementsFulfilled = missedRequiredItems.length === 0;

	if (allRequirementsFulfilled) {
		// Send the reward of work.

		yield* put(transaction({
			tgoId: workTgo.workOutputInventoryTgoId ?? workDoerTgo.tgoId,
			items: workTgo.workRecipe.output,
		}));
		return 'completed';
	}

	return 'ongoing';
}

const handleCancelWork = function* (workDoerTgoId: TgoId, workTgoId: TgoId) {
	const s= yield* select();
	const workDoerTgo = s.tgos[workDoerTgoId];
	const workTgo = s.tgos[workTgoId];
	if (!isComponentWork(workTgo)) return false;

	const redeem = (to: TgoType & ComponentInventory, from: TgoType & ComponentInventory) => {
		const redeemableInventoryItems = from.inventory.filter(ii => s.itemTypes[ii.typeId].redeemable)
		return transaction({
			tgoId: from.tgoId,
			items: redeemableInventoryItems.map(ii => ({...ii, count: ii.count * -1})),
		},
		{
			tgoId: to.tgoId,
			items: redeemableInventoryItems,
		});
	};

	if (!hasComponentInventory(workTgo) || !hasComponentInventory(workDoerTgo)) return false;
	yield* put(redeem(workDoerTgo, workTgo));
}

/*
	If actor commits items
		Creates an inventory to track actor committed items
	If target commits items
		Creates an inventory to track target committed items

	Creates a work tgo with recipe, above inventories and goal tgoId

	//Adds work as item into goal inventory
	Adds work as a goal work.

	Notes:
		* Why does the work need to know about goal?
			* Inform the goal on work completion.
		* This only has very simple conditional logic. Doesn't need to be a saga at all.
		* This doesn't work as a standalone code anyway, requires goals to trigger.
*/

export const handleCreateWork = function* ({ payload: { recipe, workerTgoId, inputInventoryTgoIds, outputInventoryTgoId, /* goalTgoId, */ }}: ActionType<typeof createWork>) {
	const s= yield* select();
	// const goalTgo = s.tgos[goalTgoId];
	// if (!isComponentGoal(goalTgo)) return;

	if (inputInventoryTgoIds.some(inputInventoryTgoId => !selectTgo(s, inputInventoryTgoId))) {
		throw new Error('Tgos matching inputInventoryTgoIds in handleCreateWork not found!');
	}

	if (outputInventoryTgoId && !selectTgo(s, outputInventoryTgoId)) {
		throw new Error('Tgo matching outputInventoryTgoId in handleCreateWork not found!');
	}

	const addTgoWithId = (...params: Parameters<typeof addTgo>): [ReturnType<typeof addTgo>, TgoId] => {
		const addTgoAction = addTgo(...params);
		return [addTgoAction, addTgoAction.payload.tgo.tgoId];
	};

	const emptyVirtualInventory = {
		inventory: [],
		isInventoryVirtual: true,
	};

	const workInputCommittedItemsTgoAction: Array<[TgoId, ReturnType<typeof addTgo>]> = recipe.input.length > 0
		? inputInventoryTgoIds.map<[TgoId, ReturnType<typeof addTgo>]>(inputInventoryTgoId => [inputInventoryTgoId, addTgo(emptyVirtualInventory)])
		: [];
	if (workInputCommittedItemsTgoAction.length > 0)
		yield* all(workInputCommittedItemsTgoAction.map(([, action]) => put(action)));
	const s2= yield* select();
	// const workTargetCommittedItemsTgoAction = recipe.output.length > 0
	// 	? addTgo(emptyVirtualInventory)
	// 	: undefined;
	// if (workTargetCommittedItemsTgoAction)
	// 	yield* put(workTargetCommittedItemsTgoAction)

	// Add a Work TgoId
	const [addWorkAction, workTgoId] = addTgoWithId({
		workRecipe: recipe,
		workInputInventoryTgoIds: recipe.input.length > 0 ? inputInventoryTgoIds : [],
		workOutputInventoryTgoId: recipe.output.length > 0 ? outputInventoryTgoId : undefined,
		workInputCommittedItemsTgoId: workInputCommittedItemsTgoAction.length > 0
			? Object.fromEntries(
				workInputCommittedItemsTgoAction.map(([tgoId, createInventoryAction]) => [tgoId, createInventoryAction.payload.tgo.tgoId]) ?? []
			)
			: undefined,
		// workTargetCommittedItemsTgoId: workTargetCommittedItemsTgoAction?.payload.tgo.tgoId,
	});
	yield* put(addWorkAction);

	// Add the WorkTgoId to inventory
	if (workerTgoId) {
		yield* put(inventoryAddTgoId(
			workerTgoId,
			workTgoId
		));
	}

	// Add the WorkTgoId to Goal inventory
	// yield* put(inventoryAddTgoId(
	// 	goalTgoId,
	// 	newWorkAction.payload.tgo.tgoId
	// ));

	// Add the WorkTgoId as a goal work
	// yield* put(goalAddWork(goalTgoId, newWorkAction.payload.tgo.tgoId));
}

const handleRemoveWork = function* ({ payload: { tgoId, workTgoId }}: ActionType<typeof removeWork>) {
	const s= yield* select();
	const work = s.tgos[workTgoId];
	
	if (work.workInputCommittedItemsTgoId && Object.entries(work.workInputCommittedItemsTgoId).length > 0)
		yield* all(Object.keys(work.workInputCommittedItemsTgoId).map(tgoId => removeTgo(tgoId as TgoId)).map(action => put(action)));
	// if (work.workTargetCommittedItemsTgoId)
	// 	yield* put(removeTgo(work.workTargetCommittedItemsTgoId));
	yield* put(removeTgo(workTgoId));
	yield* put(removeTgoId(tgoId, workTgoId));
}

const handleWorksForOwner = function* (owner: TgoType & ComponentWorkDoer & ComponentInventory) {
	const s= yield* select();
	if (owner.inventory.length <= 0) {
		return false;
	}

	const works = owner.inventory
		.filter((ii): ii is InventoryItem & { tgoId: TgoId } => ii.tgoId !== undefined)
		.map(ii => s.tgos[ii.tgoId])
		.filter(isComponentWork);

	const activeWork = works[0];
	if (!activeWork)
		return true;

	// yield* handleGoalIds(owner.tgoId, owner.activeGoals[0]);
	const workResult = yield* handleWork(owner, activeWork);

	if (['completed', 'error'].includes(workResult)) {
		yield* put(removeTgoId(owner.tgoId, activeWork.tgoId))
		return (works.length === 1); // Completed All Works?
	}

	return false;
}

const handleWorkTick = function* () {
	const s= yield* select();
	const workOwners = Object.values(s.tgos)
		.filter(hasComponentWorkDoer)
		.filter(hasComponentInventory);

	for (const workOwner of workOwners) yield* call(handleWorksForOwner, workOwner);
};

const inventoryItemRequirementFulfilled = (owned: InventoryItem, required: InventoryItem) =>
	owned === required
	|| (required.tgoId !== undefined && owned.tgoId === required.tgoId)
	|| (owned.typeId === required.typeId && owned.count >= required.count);

const inventoryHasItem = (tgo: ComponentInventory, required: InventoryItem) =>
	tgo.inventory.some(ii => inventoryItemRequirementFulfilled(ii, required))

type TgoInventoryItem = Required<Pick<InventoryItem, 'tgoId'>>;
type TgoIds = ReadonlyArray<TgoInventoryItem>;

const inventoryTgoIds = (tgo: ComponentInventory): TgoIds =>
	tgo.inventory.filter(ii => ii.tgoId) as TgoIds;

const populateInventoryTgoIds = (store: RootStateType, tgo: ComponentInventory) =>
	inventoryTgoIds(tgo).map(ii => store.tgos[ii.tgoId]);

const createTransactionForOutput = function* (tgo: TgoType & ComponentWorkDoer, output: Inventory) {
	if (output.length === 0) return;
	if (output.length > 1) throw new Error('createTransactionForOutput doesn\'t support multiple outputs');

	if (!hasComponentInventory(tgo)) return;

	const possibleRecipes = tgo.recipeInfos.filter(ri => ri.recipe.output.some(recipeOutput => recipeOutput.typeId === output[0].typeId));

	if (possibleRecipes.length === 0) return;

	const possibleRecipe = possibleRecipes[0].recipe;
	const transactioni = possibleRecipe.input.every(ii => inventoryHasItem(tgo, ii))
		? transaction(
			{
				tgoId: tgo.tgoId,
				items: [
					...possibleRecipe.input.map(ii => ({ ...ii, count: ii.count * -1 })),
					...possibleRecipe.output,
				],
			},
		)
		: undefined;
	if (transactioni) {
		const res = yield* put(transactioni);
	}
}

export const workRootSaga = function* () {
	if (!isServer) return;
	yield* tryWrapTakeEvery(getType(createWork), handleCreateWork);
	yield* takeEvery(getType(removeWork), handleRemoveWork);
	yield* takeEvery(getType(tick), handleWorkTick);
};
