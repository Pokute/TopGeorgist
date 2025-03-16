import { type ActionType, createAction, getType } from 'typesafe-actions';

import { type Recipe } from '../concerns/recipe.ts';
import { type TgoId, type TgoType, type TgoRoot } from '../reducers/tgo.ts';
import { type Inventory, addTgoId as inventoryAddTgoId, type ComponentInventory, hasComponentInventory, removeTgoId as inventoryRemoveTgoId, type InventoryItem, inventory } from './inventory.ts';
import { transaction, transactionReducer } from '../concerns/transaction.ts';
import { type RootStateType } from '../reducers/index.ts';
import { add as addTgo, remove as removeTgo, tgosReducer, type TgosState } from './tgos.ts';
import { type TypeId } from '../reducers/itemType.ts';
import type { Opaque } from '../typings/global.d.ts';
import { hasComponentVisitable } from '../data/components_new.ts';
import { hasComponentPosition } from '../components/position.ts';
import { mapPosition } from './map.ts';

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
		workIssuerTgoId,
		outputCountInventoryTgoIds,
	}: {
		recipe: Recipe,
		workerTgoId: TgoId,
		inputInventoryTgoIds: ReadonlyArray<TgoId>,
		outputInventoryTgoId: WorkTargetInventory,
		workIssuerTgoId?: TgoId,
		outputCountInventoryTgoIds?: ReadonlyArray<TgoId>,
	}) => ({
		recipe,
		workerTgoId,
		inputInventoryTgoIds,
		outputInventoryTgoId,
		workIssuerTgoId: workIssuerTgoId ?? workerTgoId,
		outputCountInventoryTgoIds: outputCountInventoryTgoIds ?? [],
	})
)();

export const cancelWork = createAction('WORK_CANCEL',
	(workDoerTgoId: TgoId, workTgoId: TgoId) => ({
		workDoerTgoId,
		workTgoId,
	})
)();

export const pauseWork = createAction('WORK_PAUSE',
	(workDoerTgoId: TgoId, workTgoId: TgoId) => ({
		workDoerTgoId,
		workTgoId,
	})
)();

export const resumeWork = createAction('WORK_RESUME',
	(workDoerTgoId: TgoId, workTgoId: TgoId) => ({
		workDoerTgoId,
		workTgoId,
	})
)();

export const workActions = {
	createWork,
	createFromRecipe,
	cancelWork,
	pauseWork,
	resumeWork,
};
export type WorkActionType = ActionType<typeof workActions>;

export type AutoCommittedItemsInventoryType = Opaque<string, '__autoCommittedItemsInventory__'>;
export const autoCommittedItemsInventory: AutoCommittedItemsInventoryType = 'autoCommittedItemsInventory' as AutoCommittedItemsInventoryType;
export type WorkTargetInventory = TgoId | AutoCommittedItemsInventoryType;

// Work TGO members:

// Work issuer creates new works and assigns them to a WorkDoer. Doesn't need to be a ComponentWork itself.
// Work issuer collects the input items into workInputCommittedItemsTgoId record.
// worksIssued are the works that the issuer has created.
// Worker takes items from input inventories directly into the committed inventories.
// SubWorks created by work issuer insert their output into the committed inventories.
export type ComponentWorkIssuer =
	TgoRoot & {
		readonly worksIssued: ReadonlyArray<{
			workTgoId: TgoId,
			workDoerTgoId: TgoId,
		}>,
		readonly workInputCommittedItemsTgoId?: Record< // Keyed by committer TgoId. Committed items are already removed from input inventory, but can be redeemed.
			string, // The committer TgoId.
			TgoId | undefined // TgoId of the inventory tgo for committed items. Inventory Tgos are created and this field filled automatically when items are to be committed.
		>,
	};

export const hasComponentWorkIssuer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWorkIssuer>) =>
	tgo && (tgo.worksIssued !== undefined)

export type ComponentWork = 
	ComponentWorkIssuer & {
		// A work is a recipe in progress. There's a separate tgoId for each work. A work must (currently) be in an inventory.
		// A work must be in a workdoer's inventory to progress.
		// WorkDoer is the tgo in whose inventory this work is.
		readonly workRecipe: Recipe,
		readonly workIssuerTgoId: TgoId, // Can be different from the workDoer.
		readonly workOutputInventoryTgoId: WorkTargetInventory,
		readonly workPaused?: boolean,
		readonly workOutputCountInventoryTgoIds: ReadonlyArray<TgoId>,
	};

export const isComponentWork = <BaseT extends TgoType | ComponentWork>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWork>) =>
	tgo && typeof tgo.workRecipe !== 'undefined';

export type ComponentWorkDoer = 
	ComponentWorkIssuer & {
		readonly recipeInfos: ReadonlyArray<{
			readonly recipe: Recipe,
			readonly autoRun?:
				| 'Always' // Always keep a work around.
				| 'OnDemand' // Autogenerate work when there's demand for it.
				| 'OnInputs', // Autogenerate work if inputs are available.
		}>,
	};

export const hasComponentWorkDoer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentWorkDoer>) =>
	tgo && (tgo.recipeInfos !== undefined)

// Start with work that only requires ticks.

// work will advance
//   with Transactions from input inventories
//   or with direct insertions to committeditems by subWorks.
// work has an inventory
// work has an tgoId (because of inventory)

// since work has an tgoId, does it have other components?
//   - WorkIssuer since: Work can have requirements that have other works.

// Work is done by workDoer, so it's in workDoer's inventory.

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

// Reducer:

export const workCreatorReducer = (
	tgosState: RootStateType['tgos'],
	{ payload: { recipe, workerTgoId, workIssuerTgoId, inputInventoryTgoIds, outputInventoryTgoId, outputCountInventoryTgoIds }}: ActionType<typeof createWork>
): [RootStateType['tgos'], Error?] => {
	if (inputInventoryTgoIds.some(inputInventoryTgoId => !tgosState[inputInventoryTgoId])) {
		return [
			tgosState,
			new Error('Tgos matching inputInventoryTgoIds in handleCreateWork not found!')
		];
	}

	if (outputInventoryTgoId !== autoCommittedItemsInventory
		&& (outputInventoryTgoId && !tgosState[outputInventoryTgoId])) {
		return [
			tgosState,
			new Error('Tgos matching outputInventoryTgoId in handleCreateWork not found!')
		];
	}

	if (!hasComponentWorkIssuer(tgosState[workIssuerTgoId]))
		return [
			tgosState,
			new Error('Tgos matching workIssuerTgoId in handleCreateWork not found or not a workIssuer!')
		];

	const addTgoWithId = (...params: Parameters<typeof addTgo>): [ReturnType<typeof addTgo>, TgoId] => {
		const addTgoAction = addTgo(...params);
		return [addTgoAction, addTgoAction.payload.tgo.tgoId];
	};

	const workInputCommittedItemsTgoIds: ReadonlyArray<TgoId> = recipe.input.length > 0
		? [
			...inputInventoryTgoIds,
			...(recipe.input.find(ii => ii.typeId === 'tick' as TypeId)?.count ?? 0) > 0
				? [
					'tickSourceDummyTgoId' as TgoId
				]
				: []
		]
		: [];

	// Add a Work Tgo
	const [addWorkAction, workTgoId] = addTgoWithId({
		workRecipe: recipe,
		workIssuerTgoId,
		workOutputInventoryTgoId: recipe.output.length > 0 ? outputInventoryTgoId : undefined,
		workInputCommittedItemsTgoId: workInputCommittedItemsTgoIds.length > 0
			? Object.fromEntries(
				workInputCommittedItemsTgoIds.map(tgoId => [tgoId, undefined])
			)
			: undefined,
		worksIssued: [],
		workOutputCountInventoryTgoIds: outputCountInventoryTgoIds,
	});

	const actions = [
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

	const tgosStateWithActions = actions.reduce(
		(currentTgosState, action) => tgosReducer(currentTgosState, action),
		tgosState
	);

	const workIssuer = tgosStateWithActions[workIssuerTgoId];
	if (!hasComponentWorkIssuer(workIssuer))
		return [
			tgosState,
			new Error('Tgos matching workIssuerTgoId in handleCreateWork not found or not a workIssuer! This should really not happen')
		];
	const tgosStateWithIssuerModified: TgosState = {
		...tgosStateWithActions,
		[workIssuerTgoId]: {
			...workIssuer,
			worksIssued: [
				...workIssuer.worksIssued,
				{
					workDoerTgoId: workerTgoId,
					workTgoId: workTgoId,
				},
			],
		},
	};

	return [tgosStateWithIssuerModified];
};

export const cleanupWorkIssuerInside = (tgos: TgosState, workIssuerTgo: ComponentWorkIssuer) => {
	if (!hasComponentWorkIssuer(workIssuerTgo))
		throw new Error('Work issuer is not a work issuer.');
	// Remove issued works.
	const afterIssuedWorksRemove = workIssuerTgo.worksIssued.reduce(
		(currentTgosState, workIssued) => isComponentWork(currentTgosState[workIssued.workTgoId])
			? cleanupWork(currentTgosState, currentTgosState[workIssued.workTgoId] as ComponentWork, workIssued.workDoerTgoId)
			: currentTgosState,
		tgos
	);

	// Remove committedInventories
	const cleanupActions = [
		...Object.values(workIssuerTgo.workInputCommittedItemsTgoId ?? {})
			.filter(function (committedInventoryTgoId): committedInventoryTgoId is TgoId { return (committedInventoryTgoId !== undefined); })
			.map(committedInventoryTgoId => removeTgo(committedInventoryTgoId)),
	];

	const afterActions = cleanupActions.reduce(
		(currentTgosState, currentAction) => tgosReducer(currentTgosState, currentAction),
		afterIssuedWorksRemove
	);

	return afterActions;
}

export const cleanupWorkIssuer = (tgos: TgosState, workIssuerTgo: ComponentWorkIssuer): TgosState => {
	const afterInner = cleanupWorkIssuerInside(tgos, workIssuerTgo);
	const cleanupActions = [
		removeTgo(workIssuerTgo.tgoId),
	];

	const afterActions = cleanupActions.reduce(
		(currentTgosState, currentAction) => tgosReducer(currentTgosState, currentAction),
		afterInner
	);

	return afterActions;
};

export const cleanupWork = (tgos: TgosState, workTgo: ComponentWork, workDoerTgoId: TgoId): TgosState => {
	const afterCleanupWorkIssuer = cleanupWorkIssuer(tgos, workTgo);

	// Remove work from workIssuer's worksIssued list.
	const issuerTgo = afterCleanupWorkIssuer[workTgo.workIssuerTgoId];
	if (!hasComponentWorkIssuer(issuerTgo))
		return afterCleanupWorkIssuer;

	const tgosAfterIssuerRemove: TgosState = {
		...afterCleanupWorkIssuer,
		[issuerTgo.tgoId]: {
			...issuerTgo,
			worksIssued: issuerTgo.worksIssued.filter(wi => wi.workTgoId !== workTgo.tgoId),
		},
	};

	// Remove work from workDoer inventory and from tgos
	const cleanupActions = [
		inventoryRemoveTgoId(workDoerTgoId, workTgo.tgoId),
		removeTgo(workTgo.tgoId),
	];

	const afterActions = cleanupActions.reduce(
		(currentTgosState, currentAction) => tgosReducer(currentTgosState, currentAction),
		tgosAfterIssuerRemove
	);

	return afterActions;
};

// Makes sure that a workInputCommittedItemsTgoId inventory exists for the tgoIds.
const ensureItemsCommittedInventoriesForTgoIds = (tgosState: TgosState, workIssuer: ComponentWorkIssuer, tgoIds: ReadonlyArray<TgoId>): TgosState => {
	const worksMissingCommittedInventories = tgoIds
		.filter(tgoId => (workIssuer.workInputCommittedItemsTgoId ?? {})[tgoId] === undefined);

	const addTgoWithId = (...params: Parameters<typeof addTgo>): [ReturnType<typeof addTgo>, TgoId] => {
		const addTgoAction = addTgo(...params);
		return [addTgoAction, addTgoAction.payload.tgo.tgoId];
	};

	const emptyVirtualInventoryTgo: Omit<ComponentInventory, 'tgoId'> = {
		inventory: [],
		inventoryIsPhysical: true,
		inventoryIsStorableOnly: false,
	};
	
	const committedItemsInventoriesCreateActions = worksMissingCommittedInventories.map(tgoId => ({
		tgoId,
		addInventoryTgoAction: addTgoWithId(emptyVirtualInventoryTgo),
	}));
	
	const workIssuerWithNewWorkInputCommittedItems: typeof workIssuer = {
		...workIssuer,
		workInputCommittedItemsTgoId: {
			...workIssuer.workInputCommittedItemsTgoId,
			...Object.fromEntries(
				committedItemsInventoriesCreateActions.map(({ tgoId, addInventoryTgoAction: inventoryAction }) => [ tgoId, inventoryAction[1] ])
			)
		}
	}

	const afterNewWorkTgo: TgosState = {
		...tgosState,
		[workIssuerWithNewWorkInputCommittedItems.tgoId]: workIssuerWithNewWorkInputCommittedItems,
	};

	const afterCommittedInventoryAdd: TgosState = committedItemsInventoriesCreateActions.reduce(
		(currentTgosState, addTgoAction) => tgosReducer(currentTgosState, addTgoAction.addInventoryTgoAction[0]),
		afterNewWorkTgo
	);

	return afterCommittedInventoryAdd;
};

export const workWithCompletionsReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
	workDoerTgoId: TgoId,
	workTgoId: TgoId
): RootStateType['tgos'] => {
	const workTgo = tgosState[workTgoId];
	if (!isComponentWork(workTgo)) {
		throw new Error(`workWithCompleationsReducer: tgo ${workTgo.tgoId} is not a ComponentWork.`);
	}

	const committedItems = workIssuerGetCommittedItems(tgosState, workTgo);
	
	const missingInput = inventory.zeroCountsRemoved(
		inventory.combined([
			...workTgo.workRecipe.input,
			...inventory.negated(committedItems)
	]));

	const workDoer = tgosState[workDoerTgoId];
	const accessibleInventoryTgoIds = [
		...Object.keys(workTgo.workInputCommittedItemsTgoId ?? {})
			.filter(tgoId => tgoId),
		...((hasComponentPosition(workDoer) && Object.values(tgosState)
			.filter(hasComponentVisitable)
			.filter(hasComponentInventory)
			.filter(tgo => mapPosition.matching(tgo.position, workDoer.position))
		) || [])
			.map(tgo => tgo.tgoId),
	];
	const participantsWithCommitables = accessibleInventoryTgoIds
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
					inventoryIsPhysical: true,
					inventoryIsStorableOnly: false,
				} as ComponentInventory,
		}))
		.filter(({ tgo }) => tgo !== undefined) // SubWorks may already have completed their work. Thus only the committedItems inventory remains.
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
	
	const afterEnsureCommittedItemInventories = ensureItemsCommittedInventoriesForTgoIds(tgosState, workTgo, participantsWithItemsToCommit.map(p => p.tgoId));
	const workTgoWithNewWorkInputCommittedItems = afterEnsureCommittedItemInventories[workTgoId];
	if (!isComponentWork(workTgoWithNewWorkInputCommittedItems)) {
		throw new Error();
	}

	const inputTransactions = participantsWithItemsToCommit // remove from input
		.filter(({ tgoId }) => tgoId !== 'tickSourceDummyTgoId') // Skip the tick source, it's not a real Tgo.
		.map(p => ({ // Remove items from participant.
			tgoId: p.tgoId,
			items: p.itemsToCommit.map(ii => ({ ...ii, count: -1 * ii.count })),
		}));
	const committedInventoryTransactions = participantsWithItemsToCommit // Add to committed
		.map(p => ({ // Add items to committed items.
			tgoId: workTgoWithNewWorkInputCommittedItems.workInputCommittedItemsTgoId[p.tgoId]!, // We just created inventory so we know it exists.
			items: p.itemsToCommit
		}));

	const transactions = [
			...inputTransactions,
			...committedInventoryTransactions,
		];

	const afterCommittingTgosState = transactions.reduce(
		(currentTgosState, currentTransaction) => transactionReducer(currentTgosState, itemTypesState, transaction(currentTransaction)),
		afterEnsureCommittedItemInventories
	);

	const allRequirementsFulfilled = missedRequiredItems.length === 0;

	if (allRequirementsFulfilled) {
		// Send the reward of work.

		if (workTgo.workRecipe.output.length > 0) {
			const countInventoryOutputs = workTgo.workOutputCountInventoryTgoIds.map(tgoId => ({
				tgoId,
				items: workTgo.workRecipe.output,
			}));

			if (workTgo.workOutputInventoryTgoId !== 'autoCommittedItemsInventory') {
				const afterRewardTgosState = transactionReducer(afterCommittingTgosState, itemTypesState, transaction({
					tgoId: workTgo.workOutputInventoryTgoId as TgoId,
					items: workTgo.workRecipe.output,
				}, ...countInventoryOutputs));
				return cleanupWork(afterRewardTgosState, workTgo, workDoerTgoId);
			}

			const issuerTgo = afterCommittingTgosState[workTgo.workIssuerTgoId];
			if (!hasComponentWorkIssuer(issuerTgo))
				throw new Error('WorkIssuer not found.');
			const afterEnsuredOutputCommittingInventory = ensureItemsCommittedInventoriesForTgoIds(afterCommittingTgosState, issuerTgo, [workTgoId]);
			const issuerTgoAfterEnsuringCommittingInventory = afterEnsuredOutputCommittingInventory[workTgo.workIssuerTgoId];
			if (!hasComponentWorkIssuer(issuerTgoAfterEnsuringCommittingInventory))
				throw new Error('WorkIssuer not found.');
			const afterRewardTgosState = transactionReducer(afterEnsuredOutputCommittingInventory, itemTypesState, transaction({
				tgoId: issuerTgoAfterEnsuringCommittingInventory.workInputCommittedItemsTgoId[workTgoId]!,
				items: workTgo.workRecipe.output,
			}, ...countInventoryOutputs));
			return cleanupWork(afterRewardTgosState, workTgo, workDoerTgoId);
		}

		const tgosAfterCleanup = cleanupWork(afterCommittingTgosState, workTgo, workDoerTgoId);
		return tgosAfterCleanup;
	}

	return workIssuerCreateWorksOnRequiredItems(
		afterCommittingTgosState,
		workTgoId,
		missedRequiredItems,
		workDoerTgoId,
		autoCommittedItemsInventory
	);
};

export const workIssuerCreateWorksOnRequiredItems = (
	tgosState: TgosState,
	workIssuerTgoId: TgoId,
	requiredItems: Inventory,
	workDoerTgoId: TgoId = workIssuerTgoId,
	overrideTargetInventoryTgoId: WorkTargetInventory,
	outputCountInventoryTgoIds: ReadonlyArray<TgoId> = [],
) => {
	const workDoer = tgosState[workDoerTgoId];
	if (!hasComponentWorkDoer(workDoer) || !hasComponentInventory(workDoer)) {
		throw new Error();
	}
	const workIssuer = tgosState[workIssuerTgoId];
	if (!hasComponentWorkIssuer(workIssuer)) {
		throw new Error();
	}

	const workableRequiredItems = requiredItems.filter(({ typeId }) => typeId !== 'tick');
	if (workableRequiredItems.length === 0)
		return tgosState;

	const activeRecipes = workIssuer.worksIssued
		.map(({ workTgoId }) => tgosState[workTgoId])
		.filter(isComponentWork)
		.map(({ workRecipe }) => workRecipe);

	const activeRecipeOutputs = activeRecipes
		.map(({ output }) => output)
		.flat()
		.filter(({ count }) => count > 0);

	// Find out which required items already have subworks.
	const missedRequiredItemsWithoutActiveWork = workableRequiredItems
		.filter(({ typeId }) => !activeRecipeOutputs.some(({ typeId: recipeOutputTypeId }) => recipeOutputTypeId === typeId ));

	// Filter workDoer's recipes that are possible have autoRun recipes to fulfill the requirements.
	const possibleRequiredItemsWithoutActiveWork = missedRequiredItemsWithoutActiveWork
		.filter(({ typeId }) => workDoer.recipeInfos
				.filter(({ autoRun }) => autoRun === 'OnDemand')
				.some(({ recipe }) => recipe.output.some(({ typeId: recipeOutputTypeId }) =>  recipeOutputTypeId === typeId))
		);

	if (possibleRequiredItemsWithoutActiveWork.length === 0)
		return tgosState;

	const tgosAfterAutoRecipeCreate = createWorksOnRequiredItems(
		tgosState,
		workDoerTgoId,
		possibleRequiredItemsWithoutActiveWork,
		overrideTargetInventoryTgoId,
		workIssuerTgoId,
		outputCountInventoryTgoIds
	);

	return tgosAfterAutoRecipeCreate;
};

export const workIssuerGetCommittedItems = (
	tgosState: TgosState,
	workIssuer: ComponentWorkIssuer,
): Inventory => {
	const committedInventories = Object.values(workIssuer.workInputCommittedItemsTgoId ?? {})
		.filter(function (committedInventoryTgoId): committedInventoryTgoId is TgoId { return (committedInventoryTgoId !== undefined); })
		.map(workInputTgoIdCommittedInventoryTgoId => tgosState[workInputTgoIdCommittedInventoryTgoId]?.inventory ?? []);

	return inventory.zeroCountsRemoved(
		inventory.combined(committedInventories.flat(1))
	);
};

export const workCancelReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
	{ payload: { workDoerTgoId, workTgoId }}: ActionType<typeof cancelWork>,
): RootStateType['tgos'] => {
	const workDoer = tgosState[workDoerTgoId];
	const work = tgosState[workTgoId];
	if (
		!isComponentWork(work)
		|| !hasComponentInventory(workDoer)
		|| !workDoer.inventory.some(ii => ii.tgoId === workTgoId)
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

	const redeemed = Object.entries(work.workInputCommittedItemsTgoId)
		.filter(([inputTgoId]) => inputTgoId !== 'tickSourceDummyTgoId')
		.map(([inputTgoId, inputCommittedInventoryTgoId]) => redeem(tgosState[inputTgoId], inputCommittedInventoryTgoId ? tgosState[inputCommittedInventoryTgoId] : undefined))
		.flat()
		.reduce(
			(currentTgosState, currentTransaction) => transactionReducer(currentTgosState, itemTypesState, currentTransaction),
			tgosState
		);

	const tgosAfterCleanup = cleanupWork(redeemed, work, workDoerTgoId);
	return tgosAfterCleanup;
}

export const workPauseReducer = (
	tgosState: RootStateType['tgos'],
	{ payload: { workDoerTgoId, workTgoId }}: ActionType<typeof pauseWork>,
): RootStateType['tgos'] => {
	return {
		...tgosState,
		[workTgoId]: {
			...tgosState[workTgoId],
			workPaused: true,
		},
	};
};

export const workResumeReducer = (
	tgosState: RootStateType['tgos'],
	{ payload: { workDoerTgoId, workTgoId }}: ActionType<typeof resumeWork>,
): RootStateType['tgos'] => {
	return {
		...tgosState,
		[workTgoId]: {
			...tgosState[workTgoId],
			workPaused: false,
		},
	};
};

const createWorksForRecipes = (
	tgosState: TgosState,
	workDoer: ComponentWorkDoer & ComponentInventory,
	recipes: ReadonlyArray<Recipe>,
	targetInventoryTgoId: WorkTargetInventory,
	workIssuerTgoId: TgoId = workDoer.tgoId,
	outputCountInventoryTgoIds: ReadonlyArray<TgoId> = [],
) => {
	const getInventoryTgoIds2 = (tgos: RootStateType['tgos'], tgo: ComponentInventory) =>
		inventoryTgoIds(tgo).map(ii => tgos[ii.tgoId]);

	const createWorkActions = recipes.map(recipe => createWork({
		recipe,
		workerTgoId: workDoer.tgoId,
		inputInventoryTgoIds: [ workDoer.tgoId ],
		outputInventoryTgoId: targetInventoryTgoId,
		workIssuerTgoId,
		outputCountInventoryTgoIds,
	}));

	const tgosAfterAutoRecipeCreate = createWorkActions
		.reduce(
			(currentTgosState, createWorkAction) => {
				const owner = currentTgosState[workDoer.tgoId];
				if (owner && hasComponentInventory(owner)) {
					if (!getInventoryTgoIds2(currentTgosState, owner)
						.filter(isComponentWork)
						.some(work => work.workRecipe.type === createWorkAction.type))
						{
							return workCreatorReducer(currentTgosState, createWorkAction)[0];
						}
				}
				return currentTgosState;
			},
			tgosState
		);

	return tgosAfterAutoRecipeCreate;
};

export const createWorksOnRequiredItems = (
	tgosState: TgosState,
	workDoerTgoId: TgoId,
	requiredItems: Inventory,
	targetInventoryTgoId: WorkTargetInventory,
	workIssuerTgoId: TgoId = workDoerTgoId,
	outputCountInventoryTgoIds: ReadonlyArray<TgoId> = [],
) => {
	const combinedRequiredItems = inventory.combined(requiredItems);

	const workDoer = tgosState[workDoerTgoId];
	if (!hasComponentInventory(workDoer) || !hasComponentWorkDoer(workDoer))
		return tgosState;

	const demandedAutoRecipes = workDoer.recipeInfos
		.filter(recipeInfo =>
			recipeInfo.autoRun == 'OnDemand'
			&& combinedRequiredItems.some((req) => recipeInfo.recipe.output.some(output => output.typeId === req.typeId))
		).map(recipeInfo => recipeInfo.recipe);

	return createWorksForRecipes(
		tgosState,
		workDoer,
		demandedAutoRecipes,
		targetInventoryTgoId,
		workIssuerTgoId,
		outputCountInventoryTgoIds
	);
}

const workDoerTickReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
	workDoer: ComponentWorkDoer & ComponentInventory
): RootStateType['tgos'] => {
	
	const getInventoryTgoIds2 = (tgos: RootStateType['tgos'], tgo: ComponentInventory) =>
		inventoryTgoIds(tgo).map(ii => tgos[ii.tgoId]);

	const autoRunRecipes = [
		...workDoer.recipeInfos.filter(recipeInfo => recipeInfo.autoRun === 'Always'),
		...workDoer.recipeInfos.filter(recipeInfo => recipeInfo.autoRun === 'OnInputs')
			.filter(recipeInfo => inventory.combined([
					...workDoer.inventory,
					...inventory.negated(recipeInfo.recipe.input)
				]).every(ii => ii.count >= 0 || ii.typeId === 'tick')
			),
	];

	const activeWorks = workDoer.inventory
		.filter(ii => ii.typeId === 'tgoId' && ii.tgoId)
		.map(ii => tgosState[ii.tgoId!]).filter(isComponentWork);
	const recipesToStart = autoRunRecipes.filter(recipeInfo =>
		!activeWorks.some(activeWork => activeWork.workRecipe.type === recipeInfo.recipe.type)
	).map(recipeInfo => recipeInfo.recipe);

	const tgosAfterAutoRecipeCreate = createWorksForRecipes(
		tgosState,
		workDoer,
		recipesToStart,
		workDoer.tgoId,
	);

	const workDoer2 = tgosAfterAutoRecipeCreate[workDoer.tgoId];
	if (!hasComponentInventory(workDoer2) || !hasComponentWorkDoer(workDoer2)) {
		return tgosAfterAutoRecipeCreate;
	}
	const works = getInventoryTgoIds2(tgosAfterAutoRecipeCreate, workDoer2)
		.filter(isComponentWork)
		.filter(work => !work.workPaused);

	const afterWorksTgosState = works.reduce(
		(currentTgosState, work) => workWithCompletionsReducer(currentTgosState, itemTypesState, workDoer2.tgoId, work.tgoId),
		tgosAfterAutoRecipeCreate
	);

	return afterWorksTgosState;
};

export const workDoersTickReducer = (
	tgosState: RootStateType['tgos'],
	itemTypesState: RootStateType['itemTypes'],
): RootStateType['tgos'] => {
	const workDoers = Object.values(tgosState)
		.filter(hasComponentWorkDoer)
		.filter(hasComponentInventory);
	
	return workDoers.reduce(
		(tgos, workDoer) => workDoerTickReducer(tgos, itemTypesState, workDoer),
		tgosState,
	)
};
