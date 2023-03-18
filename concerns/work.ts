import { put, all, takeEvery, call } from 'typed-redux-saga';
import { ActionType, createAction, getType } from 'typesafe-actions';

import { Recipe } from '../reducers/recipe.js';
import { TgoId, TgoType, TgoRoot } from '../reducers/tgo.js';
import { Inventory, addTgoId as inventoryAddTgoId, ComponentInventory, hasComponentInventory, removeTgoId, InventoryItem } from './inventory.js';
import { transaction, transactionReducer } from '../concerns/transaction.js';
import { RootStateType } from '../reducers/index.js';
import { add as addTgo, remove as removeTgo } from '../actions/tgos.js';
// import { addWork as goalAddWork, removeWork } from '../concerns/goal.js';
import isServer from '../isServer.js';
import { TypeId } from '../reducers/itemType.js';
import tgos, { getTgoByIdFromRootState } from '../reducers/tgos.js';

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

export const cancelWork = createAction('WORK_CANCEL',
	(workDoerTgoId: TgoId, workTgoId: TgoId) => ({
		workDoerTgoId,
		workTgoId,
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
		readonly workOutputInventoryTgoId?: TgoId,
		// readonly workInputCommittedItemsTgoId?: Record<TgoId, TgoId>, // Committed items are already removed from input inventory, but can be redeemed.
		readonly workInputCommittedItemsTgoId?: Record<string, TgoId>, // Keyed by committer TgoId. Committed items are already removed from input inventory, but can be redeemed.
		// readonly workTargetCommittedItemsTgoId?: TgoId, // Committed items are already removed from target's inventory, but can be redeemed.
	};

export const isComponentWork = <BaseT extends TgoType | ComponentWork>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWork>) =>
	tgo && typeof tgo.workRecipe !== 'undefined';

export type ComponentWorkDoer = 
	TgoRoot & {
		// readonly recipeInfos: Record<RecipeId, {
		readonly recipeInfos: ReadonlyArray<{
			readonly recipe: Recipe,
			readonly autoRun?: boolean,
		}>,
	};

export const hasComponentWorkDoer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWorkDoer>) =>
	tgo && (tgo.recipeInfos !== undefined)

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

const inventoryItemRequirementFulfilled = (owned: InventoryItem, required: InventoryItem) =>
	owned === required
	|| (required.tgoId !== undefined && owned.tgoId === required.tgoId)
	|| (owned.typeId === required.typeId && owned.count >= required.count);

export const inventoryHasItem = (tgo: ComponentInventory, required: InventoryItem) =>
	tgo.inventory.some(ii => inventoryItemRequirementFulfilled(ii, required))

type TgoInventoryItem = Required<Pick<InventoryItem, 'tgoId'>>;
type TgoIds = ReadonlyArray<TgoInventoryItem>;

const inventoryTgoIds = (tgo: ComponentInventory): TgoIds =>
	tgo.inventory.filter(ii => ii.tgoId) as TgoIds;

export const getInventoryTgoIds = (store: RootStateType, tgo: ComponentInventory) =>
	inventoryTgoIds(tgo).map(ii => store.tgos[ii.tgoId]);

export const workRootSaga = function* () {
	if (!isServer) return;
};

// Reducer:

export const workCreatorReducer = (
	tgosState: RootStateType['tgos'],
	{ payload: { recipe, workerTgoId, inputInventoryTgoIds, outputInventoryTgoId, /* goalTgoId, */ }}: ActionType<typeof createWork>
): [RootStateType['tgos'], Error?] => {
	if (inputInventoryTgoIds.some(inputInventoryTgoId => !tgosState[inputInventoryTgoId])) {
		return [
			tgosState,
			new Error('Tgos matching inputInventoryTgoIds in handleCreateWork not found!')
		];
	}

	if (outputInventoryTgoId && !tgosState[outputInventoryTgoId]) {
		return [
			tgosState,
			new Error('Tgos matching outputInventoryTgoId in handleCreateWork not found!')
		];
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
		? [
			...inputInventoryTgoIds.map<[owner: TgoId, action: ReturnType<typeof addTgo>]>(inputInventoryTgoId => [inputInventoryTgoId, addTgo(emptyVirtualInventory)]),
			...(recipe.input.find(ii => ii.typeId === 'tick' as TypeId)?.count ?? 0) > 0
				? [
					['tickSourceDummyTgoId' as TgoId, addTgo(emptyVirtualInventory)] as [owner: TgoId, action: ReturnType<typeof addTgo>]
				]
				: []
		]
		: [];

	// const workTargetCommittedItemsTgoAction = recipe.output.length > 0
	// 	? addTgo(emptyVirtualInventory)
	// 	: undefined;
	// if (workTargetCommittedItemsTgoAction)
	// 	yield* put(workTargetCommittedItemsTgoAction)

	// Add a Work TgoId
	const [addWorkAction, workTgoId] = addTgoWithId({
		workRecipe: recipe,
		// workInputInventoryTgoIds: recipe.input.length > 0 ? inputInventoryTgoIds : [],
		workOutputInventoryTgoId: recipe.output.length > 0 ? outputInventoryTgoId : undefined,
		workInputCommittedItemsTgoId: workInputCommittedItemsTgoAction.length > 0
			? Object.fromEntries(
				workInputCommittedItemsTgoAction.map(([tgoId, createInventoryAction]) => [tgoId, createInventoryAction.payload.tgo.tgoId]) ?? []
			)
			: undefined,
		// workTargetCommittedItemsTgoId: workTargetCommittedItemsTgoAction?.payload.tgo.tgoId,
	});

	const actions = [
		...workInputCommittedItemsTgoAction.map(([, action]) => action),
		addWorkAction,
		...(
			(workerTgoId &&
				[inventoryAddTgoId(
					workerTgoId,
					workTgoId
				)]
			) ?? []
		)
	];

	return [
		actions.reduce(
		(currentTgosState, action) => tgos(currentTgosState, action),
		tgosState
	)];

	// Add the WorkTgoId to Goal inventory
	// yield* put(inventoryAddTgoId(
	// 	goalTgoId,
	// 	newWorkAction.payload.tgo.tgoId
	// ));

	// Add the WorkTgoId as a goal work
	// yield* put(goalAddWork(goalTgoId, newWorkAction.payload.tgo.tgoId));
};

export const workWithCompletionsReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
	workDoerTgoId: TgoId,
	workTgoId: TgoId
): RootStateType['tgos'] => {
	const workDoer = tgosState[workDoerTgoId];
	if (!workDoer || !hasComponentWorkDoer(workDoer) || !hasComponentInventory(workDoer)) {
		throw new Error();
	}
	const workTgo = tgosState[workTgoId];
	if (!workTgo || !isComponentWork(workTgo)) {
		throw new Error();
	}

	const committedInventories = Object.values(workTgo.workInputCommittedItemsTgoId ?? {})
		.map(workInputTgoIdCommittedInventoryTgoId => tgosState[workInputTgoIdCommittedInventoryTgoId]?.inventory ?? []);

	const committedItems = committedInventories
		.flat(1)
		.reduce<Inventory>(
			((inv, cii) => {
				const existingInventoryItem: InventoryItem = inv.find(ii => ii.typeId === cii.typeId) ?? {
					typeId: cii.typeId,
					count: 0,
				};
				return [
					...inv.filter(ii => ii.typeId != cii.typeId),
					{
						typeId: existingInventoryItem.typeId,
						count: existingInventoryItem.count + cii.count,
					},
				];
			}),
			[]
		);

	const missingInput = workTgo.workRecipe.input
		.map(ii => ({
			...ii,
			count: ii.count -
				(committedItems.find(({ typeId: committedTypeId }) => committedTypeId === ii.typeId)?.count ?? 0)
		}))
		.filter(ii => ii.count !== 0);

	const participantsWithCommitables = Object.keys(workTgo.workInputCommittedItemsTgoId ?? {})
		.filter(tgoId => tgoId)
		.map(inputTgoId => ({
			tgoId: inputTgoId as TgoId,
			tgo: inputTgoId !== 'tickSourceDummyTgoId' as TgoId
				? tgosState[inputTgoId]
				: {
					tgoId: 'tickSourceDummyTgoId' as TgoId,
					inventory: [{
						typeId: 'tick' as TypeId,
						count: 1,
					}],
				} as ComponentInventory,
		}))
		.map(participant => ({
			...participant,
			committableRequiredInventoryTypes: missingInput
				.map(requiredItem => requiredItem.typeId)
				.filter(typeId => participant.tgo.inventory?.some(pii => pii.typeId === typeId)
				)
		}))
		.map(participant => ({
			...participant,
			committableRequiredItems: [
				...participant
					.committableRequiredInventoryTypes.map(typeId => ({
						typeId,
						count: (participant.tgo.inventory ?? []).find(ii => ii.typeId === typeId)?.count ?? 0
					})),
			]
			.filter(items => items.count > 0) // Don't add 0 counts to transactions.
		}));

	const [missedRequiredItems, participantsWithItemsToCommit] = participantsWithCommitables
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

	const inputTransactions = participantsWithItemsToCommit // remove from input
		.filter(({ tgoId }) => tgoId !== 'tickSourceDummyTgoId') // Skip the tick source, it's not a real Tgo.
		.map(p => ({ // Remove items from participant.
			tgoId: p.tgoId,
			items: p.itemsToCommit.map(ii => ({ ...ii, count: -1 * ii.count })),
		}));
	const committedInventoryTransactions = participantsWithItemsToCommit // Add to committed
		.map(p => ({ // Add items to committed items.
			tgoId: workTgo.workInputCommittedItemsTgoId[p.tgoId],
			items: p.itemsToCommit
		}));

	const transactions = [
		...inputTransactions,
		...committedInventoryTransactions,
	];

	const afterCommittingTgosState = transactions.reduce(
		(currentTgosState, currentTransaction) => transactionReducer(currentTgosState, itemTypesState, transaction(currentTransaction)),
		tgosState
	);

	const allRequirementsFulfilled = missedRequiredItems.length === 0;

	if (allRequirementsFulfilled) {
		// Send the reward of work.

		const afterRewardTgosState = transactionReducer(afterCommittingTgosState, itemTypesState, transaction({
			tgoId: workTgo.workOutputInventoryTgoId ?? workDoerTgoId,
			items: workTgo.workRecipe.output,
		}));

		const cleanupActions = [
			...Object.values(workTgo.workInputCommittedItemsTgoId ?? {})
				.map(committedInventoryTgoId => removeTgo(committedInventoryTgoId)),
			removeTgoId(workDoerTgoId, workTgoId),
			removeTgo(workTgoId),
		];

		return cleanupActions.reduce(
			(currentTgosState, currentAction) => tgos(currentTgosState, currentAction),
			afterRewardTgosState
		);
	}

	return afterCommittingTgosState;
};

const workCancelReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
	workDoerTgoId: TgoId,
	workTgoId: TgoId
): RootStateType['tgos'] => {
	const workDoer = tgosState[workDoerTgoId];
	const work = tgosState[workTgoId];
	if (
		!isComponentWork(work)
		|| !hasComponentInventory(workDoer)
		|| !workDoer.inventory.some(ii => ii.tgoId === workTgoId)
		|| !hasComponentInventory(work)
	) return tgosState;

	const redeem = (to?: TgoType, from?: TgoType) => {
		if (!hasComponentInventory(to) || !hasComponentInventory(from))
			return [];

		const redeemableInventoryItems = from.inventory.filter(ii => itemTypesState[ii.typeId].redeemable)
		if (redeemableInventoryItems.length === 0)
			return [];

		return [transaction({
			tgoId: from.tgoId,
			items: redeemableInventoryItems.map(ii => ({...ii, count: ii.count * -1})),
		},
		{
			tgoId: to.tgoId,
			items: redeemableInventoryItems,
		})];
	};

	return Object.entries(work.workInputCommittedItemsTgoId)
		.map(([inputTgoId, inputCommittedInventoryTgoId]) => redeem(tgosState[inputTgoId], tgosState[inputCommittedInventoryTgoId]))
		.flat()
		.reduce(
			(currentTgosState, currentTransaction) => transactionReducer(currentTgosState, itemTypesState, currentTransaction),
			tgosState
		);
}

const workDoerTickReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
	workDoer: ComponentWorkDoer & ComponentInventory
): RootStateType['tgos'] => {
	// Create autorun works that don't exist.

	const getInventoryTgoIds2 = (tgos: RootStateType['tgos'], tgo: ComponentInventory) =>
		inventoryTgoIds(tgo).map(ii => tgos[ii.tgoId]);

	const tgosAfterAutoRecipeCreate = workDoer.recipeInfos
		.filter(() => false)
		.filter(recipeInfo => recipeInfo.autoRun)
		.map(({recipe}) => recipe)
		.reduce(
			(currentTgosState, autoRecipe) => {
				const owner = currentTgosState[workDoer.tgoId];
				if (owner && hasComponentInventory(owner)) {
					if (!getInventoryTgoIds2(currentTgosState, owner)
						.filter(isComponentWork)
						.some(work => work.workRecipe.type === autoRecipe.type))
						{
							return workCreatorReducer(currentTgosState, createWork({
								recipe: autoRecipe,
								workerTgoId: workDoer.tgoId,
								inputInventoryTgoIds: [ workDoer.tgoId ],
								outputInventoryTgoId: workDoer.tgoId,
							}))[0];
						}
				}
				return currentTgosState;
			},
			tgosState
		);

	{
		const workDoer2 = tgosAfterAutoRecipeCreate[workDoer.tgoId];
		if (!hasComponentInventory(workDoer2) || !hasComponentWorkDoer(workDoer2)) {
			return tgosState;
		}
		const works = getInventoryTgoIds2(tgosAfterAutoRecipeCreate, workDoer2)
			.filter(isComponentWork);

		const afterWorksTgosState = works.reduce(
			(currentTgosState, work) => workWithCompletionsReducer(currentTgosState, itemTypesState, workDoer2.tgoId, work.tgoId),
			tgosAfterAutoRecipeCreate
		);

		return afterWorksTgosState;
	}
};

export const workDoersTickReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
): RootStateType['tgos'] => {
	const workDoers = Object.values(tgosState)
		.filter(hasComponentWorkDoer)
		.filter(hasComponentInventory)
	
	return workDoers.reduce(
		(tgos, workDoer) => workDoerTickReducer(tgos, itemTypesState, workDoer),
		tgosState,
	)
};
