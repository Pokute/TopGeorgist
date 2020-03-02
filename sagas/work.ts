import { select, put, all, takeEvery } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import { Work } from '../reducers/work';
import { Inventory, addTgoId as inventoryAddTgoId, ComponentInventory, hasComponentInventory, removeTgoId } from '../components/inventory';
import { TgoId, TgoType, TgoActionList } from '../reducers/tgo';
import { isComponentGoal, isComponentWork, hasComponentGoalDoer, ComponentGoalDoer, ComponentGoal, ComponentWork } from '../data/components_new';
import { transaction } from '../actions/transaction';
import { RootStateType } from '../reducers';
import { createWork } from '../actions/work';
import { add as addTgo, remove as removeTgo } from "../actions/tgos";
import { addWork as goalAddWork, removeWork } from '../actions/goal';
import isServer from '../isServer';
import { TypeId } from '../reducers/itemType';
import { getTgoByIdFromRootState } from '../reducers/tgos';

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
// Actor creates a new work to the goal
// Actor repeats below until work is complete.
//   Actor pushes (all) inventory to work through transactions.
//   Actor can also push one tick to work through transaction.
// On completion, actor collects the output from work.
// 







// {
// 	if (input.typeId === 'tick') {
// 		if (input.count <= 0)
// 			return true;
// 		const getCurrentTick = function*() { return ((yield select()) as RootStateType).ticker.currentTick; }
// 		const endTick = (yield getCurrentTick()) + input.count;
// 		while (yield getCurrentTick() < endTick) {
// 			yield false;
// 		}
// 		return true;
// 	} else {
// 		const s: RootStateType = yield select();
// 		const actorTgo = s.tgos[actorTgoId];
// 		if (!hasComponentInventory(actorTgo)) {
// 			return false;
// 		}

// 		return (actorTgo.inventory.some(i => (i.typeId === input.typeId) && (i.count >= input.count)));
// 	}
// }

const checkWorkCompletion = function* (workTgoId: TgoId) {
	const s: RootStateType = yield select();
	const workTgo = s.tgos[workTgoId];
	if (!isComponentWork(workTgo)) return undefined; // Fail
	if (workTgo.workRecipe.actorItemChanges.length == 0) return true;
	if (!hasComponentInventory(workTgo)) return false;

	return (workTgo.workRecipe.actorItemChanges.every(input => {
		const foundProgressItem = workTgo.inventory.find(progress => progress.typeId === input.typeId);
		return ((foundProgressItem !== undefined) && (foundProgressItem.count >= input.count));
	}));
}

export const handleWork = function* (
	actorTgo: ComponentGoalDoer & Partial<ComponentInventory>,
	goalTgo: ComponentGoal & Partial<ComponentInventory>,
	workTgo: ComponentWork & Partial<ComponentInventory>,
) {
	const s: RootStateType = yield select();
	if (!hasComponentGoalDoer(actorTgo)
		|| !isComponentGoal(goalTgo)
		|| !isComponentWork(workTgo)){
		return undefined; // Fail
	}

	// FIXME. work component has an inventory, but it should have TWO inventories. One for actor inv changes and one for target inv changes.
	
	const getTgoById = getTgoByIdFromRootState(s.tgos);

	const participants = [
		{ tgo: actorTgo },
		...(workTgo.workTargetTgoId ? [{ tgo: s.tgos[workTgo.workTargetTgoId] }] : [])
	];

	const participantsWithWorkInfo = participants
		.map((participant, index) => {
			const committedItemsTgoId = index == 0 ? workTgo.workActorCommittedItemsTgoId : workTgo.workTargetCommittedItemsTgoId;
			return {
				...participant,
				requiredItemCommitTgoId: committedItemsTgoId,
				itemsChange: index == 0 ? workTgo.workRecipe.actorItemChanges : workTgo.workRecipe.targetItemChanges,
				committedItems: (committedItemsTgoId ? (getTgoById(committedItemsTgoId) || { inventory: [] }).inventory : undefined) || [],
			};
		})
		.map((participant) => ({
			...participant,
			requiredItems: participant.itemsChange
				.map(ii => ({ ...ii, count: ii.count * -1}))
				.filter(({ count }) => count >= 0),
			awardItems: participant.itemsChange
				.filter(({ count }) => count > 0),
			committedRequiredItems: participant.committedItems.filter(({ count }) => count <= 0),
			committedAwardItems: participant.committedItems.filter(({ count }) => count > 0),
		}))
		.map((participant) => ({
			...participant,
			missingRequiredItems: participant.requiredItems.map(({ typeId, count }) => ({
				typeId,
				count: count - (-1 * (participant.committedItems.find(({ typeId: committedTypeId }) => committedTypeId == typeId) || { count: 0 }).count),
			})),
			missingAwardItems: participant.awardItems.map(({ typeId, count }) => ({
				typeId,
				count: count - (participant.committedAwardItems.find(({ typeId: awardTypeId }) => awardTypeId == typeId) || { count: 0 }).count,
			})),
		}));

	const allRequirementsFulfilled = participantsWithWorkInfo.every(participant =>
		participant.missingRequiredItems.every(requiredItem => requiredItem.count == 0)
	);

	const rewardOutputs = (participants: typeof participantsWithWorkInfo) => participants
		.map(participant => ({
			tgoId: participant.tgo.tgoId, missingAwardItems: participant.missingAwardItems.filter(missingAwardItem => missingAwardItem.count > 0)
		}))
		.filter(({ missingAwardItems }) => missingAwardItems.length > 0)
		

	if (allRequirementsFulfilled) {
		// Send the reawrd of work.

		const rewards = rewardOutputs(participantsWithWorkInfo);
		if (rewards.length) {
			yield put(transaction(...rewards.map(({ tgoId, missingAwardItems }) => ({
				tgoId,
				items: missingAwardItems,
			}))));
		}

		const temp = participantsWithWorkInfo
			.map(participant => ({
				tgoId: participant.tgo.tgoId, awardItems: participant.missingAwardItems.filter(missingAwardItem => missingAwardItem.count > 0)
			}))
			.filter(({ awardItems }) => awardItems.length > 0)
		return temp;
	}

	const participantsWithCommitables = participantsWithWorkInfo
		// .filter(participant => (participant.missingRequiredItems.length > 0) && (participant.missingRequiredItems.every(ii => ii.count > 0)))
		.map(participant => ({
			...participant,
			committableRequiredInventoryTypes: participant
				.missingRequiredItems
				.map(requiredItem => requiredItem.typeId)
				.filter(typeId =>
					typeId !== 'tick' &&
					(participant.tgo.inventory || [])
						.some(pii => pii.typeId === typeId)
				)
		}))
		.map(participant => ({
			...participant,
			committableRequiredItems: [
				...participant
					.committableRequiredInventoryTypes.map(typeId => ({
						typeId,
						count: Math.min(
							(participant.missingRequiredItems.find(ri => ri.typeId === typeId) || { count: 0 }).count,
							((participant.tgo.inventory || []).find(ii => ii.typeId === typeId) || { count: 0 }).count
						)
					})),
				// MOVE THIS, every participant shouldn't be able to commit ticks!
				// Add a tick if required
				// ...(participant.requiredItems.some(ri => ri.typeId === 'tick'))
				// 	? [{
				// 		typeId: 'tick' as TypeId,
				// 		count: Math.max(
				// 			-1,
				// 			(participant.missingRequiredItems.find(ri => ri.typeId === 'tick') || { count: 0 }).count
				// 		),
				// 	}]
				// 	: []
			]
			// Don't add 0 counts to transactions.
			.filter(items => items.count > 0)
		}))
	
	const transactionParticipants = [
		...participantsWithCommitables
			.filter(participant => participant.committableRequiredItems.length > 0)
			.map(p => [
				{ // Remove items from the participant.
					tgoId: p.tgo.tgoId,
					items: p.committableRequiredItems
						.filter(ri => ri.typeId !== 'tick')
						.map(ii => ({ ...ii, count: -1 * ii.count })),
				},
				{ // Add (negative) items to the committableRequiredItems.
					tgoId: p.requiredItemCommitTgoId,
					items: p.committableRequiredItems
						.map(ii => ({ ...ii, count: -1 * ii.count })), // Committed required items are negative.
				},
			]).flat(),
		// Add a tick if needed.
		...(workTgo.workActorCommittedItemsTgoId && participantsWithCommitables.some(participant => participant.missingRequiredItems.some(ri => ri.typeId === 'tick' && ri.count > 0))
			? [{
				tgoId: workTgo.workActorCommittedItemsTgoId,
				items: [{
					typeId: 'tick' as TypeId,
					count: -1,
				}]
			}]
			: []),
	];

	if (transactionParticipants.length > 0) {
		yield put(transaction(...transactionParticipants));
	}

/*
	// Find out what part of work is not yet done.
	const missingItems = workTgo.work.actorItemChanges
		// .filter(ii => ii.tgoId === undefined)
		// .filter(ii => ii.count < 0) // Negative values for work are inputs.
		.map(ii => ({ ...ii, count: ii.count - (workTgo.inventory.find(wi => wi.typeId == ii.typeId) || { count: 0 }).count}))
		.filter(ii => ii.count > 0)
		const participant = participants[0];
	if (!hasComponentInventory(participant)) return false;

	const actorItemsForWork = missingItems.map(input => {
			const actorItem = participant.inventory.find(ii => ii.typeId === input.typeId)
			if (!actorItem) return undefined;
			return {
				typeId: actorItem.typeId,
				count: Math.min(actorItem.count, input.count)
			};
		})
		.filter(input => input) as Inventory
	const workTransaction = transaction(
		{
			tgoId: actorTgoId,
			items: actorItemsForWork.map(ii => ({...ii, count: ii.count * -1}))
		},
		{
			tgoId: workTgoId,
			items: [
				...actorItemsForWork,
				...(workTgo.work.actorItemChanges.some(input => input.typeId === 'tick')
					? [{
						typeId: 'tick',
						count: 1,
					}]
					: []
				)
			]
		}
	);

	yield put(workTransaction);

	if (yield* checkWorkCompletion(workTgoId)) {
		yield put(goalRemoveWork(goalTgoId, workTgoId));
		return workTgo.work.targetItemChanges;
	}*/
	return undefined;
}

const handleCancelWork = function* (actorTgoId: TgoId, workTgoId: TgoId) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[actorTgoId];
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

	if (!hasComponentInventory(workTgo) || !hasComponentInventory(actorTgo)) return false;
	yield put(redeem(actorTgo, workTgo));
}

export const handleCreateWork = function* ({ payload: { goalTgoId, recipe: work, targetTgoId }}: ActionType<typeof createWork>) {
	const s: RootStateType = yield select();
	const goalTgo = s.tgos[goalTgoId];
	if (!isComponentGoal(goalTgo)) return;

	const emptyVirtualInventory = {
		inventory: [],
		isInventoryVirtual: true,
	};

	const workActorCommittedItemsTgoAction = work.actorItemChanges.length > 0
		? addTgo(emptyVirtualInventory)
		: undefined;
	if (workActorCommittedItemsTgoAction)
		yield put(workActorCommittedItemsTgoAction);
	const workTargetCommittedItemsTgo = work.targetItemChanges.length > 0
		? addTgo(emptyVirtualInventory)
		: undefined;
	if (workTargetCommittedItemsTgo)
		yield put(workTargetCommittedItemsTgo)

	// Add a Work TgoId
	const newWorkAction: ActionType<typeof addTgo> = yield put(addTgo({
		workRecipe: work,
		// actorTgoId: goalTgo,
		workTargetTgoId: targetTgoId,
		workActorCommittedItemsTgoId: workActorCommittedItemsTgoAction ? workActorCommittedItemsTgoAction.payload.tgo.tgoId : undefined,
		workTargetCommittedItemsTgoId: workTargetCommittedItemsTgo ? workTargetCommittedItemsTgo.payload.tgo.tgoId : undefined,
		// inventory: [],
	}));

	// Add the WorkTgoId to Goal inventory
	yield put(inventoryAddTgoId(
		goalTgoId,
		newWorkAction.payload.tgo.tgoId
	));

	// Add the WorkTgoId as a goal work
	yield put(goalAddWork(goalTgoId, newWorkAction.payload.tgo.tgoId));
}

const handleRemoveWork = function* ({ payload: { tgoId, workTgoId }}: ActionType<typeof removeWork>) {
	const s: RootStateType = yield select();
	const work = s.tgos[workTgoId];
	
	if (work.workActorCommittedItemsTgoId)
		yield put(removeTgo(work.workActorCommittedItemsTgoId));
	if (work.workTargetCommittedItemsTgoId)
		yield put(removeTgo(work.workTargetCommittedItemsTgoId));
	yield put(removeTgo(workTgoId));
	yield put(removeTgoId(tgoId, workTgoId));
}


const workRootSaga = function* () {
	if (!isServer) return;
	yield takeEvery(getType(createWork), handleCreateWork);
	yield takeEvery(getType(removeWork), handleRemoveWork);
};

export default workRootSaga;
