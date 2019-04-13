import { select, put, all, takeEvery } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import { WorkInstance } from '../reducers/workInstance';
import { Inventory, addTgoId as inventoryAddTgoId, ComponentInventory, hasComponentInventory } from '../components/inventory';
import { TgoId, TgoType } from '../reducers/tgo';
import { isComponentGoal, isComponentWork, hasComponentGoalDoer } from '../components_new';
import { transaction } from '../actions/transaction';
import { RootStateType } from '../reducers';
import { createWorkInstance } from '../actions/workInstance';
import { add as addTgo } from "../actions/tgos";
import { addWorkInstance as goalAddWorkInstance, removeWorkInstance as goalRemoveWorkInstance } from '../actions/goal';
import isServer from '../isServer';

// Start with work that only requires ticks.

// workInstance is the goal
// workInstance will advance with Transactions
// workInstance has an inventory
// workInstance has an tgoId (because of inventory)

// since workInstance has an tgoId, does it have other components?
//   - I guess no.

// should workInstance be in the owner's inventory?

// Most of the above also applies to goals.


// Actor is a tgo that has an inventoryitems of goals that have their own inventory items with works inside that have inventory.

// const advanceWorkInstanceWithInput = function* ({workInstance, actorTgoId, input}: {workInstance: WorkInstance, actorTgoId: TgoId, input: InventoryItem}) {

// }



// Steps:
//
// Actor has a Goal (get to position)
//   something recognises that we need position changes to complete it.
// Actor searches his works how to generate position changes.
// Actor creates a new workInstance to the goal
// Actor repeats below until workInstance is complete.
//   Actor pushes (all) inventory to workInstance through transactions.
//   Actor can also push one tick to workInstance through transaction.
// On completion, actor collects the output from workInstance.
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

const checkWorkInstanceCompletion = function* (workTgoId: TgoId) {
	const s: RootStateType = yield select();
	const workTgo = s.tgos[workTgoId];
	if (!isComponentWork(workTgo)) return undefined; // Fail
	if (workTgo.work.inputs.length == 0) return true;
	if (!hasComponentInventory(workTgo)) return false;

	return (workTgo.work.inputs.every(input => {
		const foundProgressItem = workTgo.inventory.find(progress => progress.typeId === input.typeId);
		return ((foundProgressItem !== undefined) && (foundProgressItem.count >= input.count));
	}));
}

export const handleWorkInstance = function* (actorTgoId: TgoId, goalTgoId: TgoId, workTgoId: TgoId) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[actorTgoId];
	const goalTgo = s.tgos[goalTgoId];
	const workTgo = s.tgos[workTgoId];
	if (!hasComponentGoalDoer(actorTgo) || !isComponentGoal(goalTgo) || !isComponentWork(workTgo) || !hasComponentInventory(workTgo)) return undefined; // Fail

	const missingItems = workTgo.work.inputs
		.filter(ii => ii.tgoId === undefined)
		.map(ii => ({ ...ii, count: ii.count - (workTgo.inventory.find(wi => wi.typeId == ii.typeId) || { count: 0 }).count}))
		.filter(ii => ii.count > 0)

	const actorItemsForWork = hasComponentInventory(actorTgo)
		? missingItems.map(input => {
				const actorItem = actorTgo.inventory.find(ii => ii.typeId === input.typeId)
				if (!actorItem) return undefined;
				return {
					typeId: actorItem.typeId,
					count: Math.min(actorItem.count, input.count)
				};
			})
			.filter(input => input) as Inventory
		: [];
	const workTransaction = transaction(
		{
			tgoId: actorTgoId,
			items: actorItemsForWork.map(ii => ({...ii, count: ii.count * -1}))
		},
		{
			tgoId: workTgoId,
			items: [
				...actorItemsForWork,
				...(workTgo.work.inputs.some(input => input.typeId === 'tick')
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

	if (yield* checkWorkInstanceCompletion(workTgoId)) {
		yield put(goalRemoveWorkInstance(goalTgoId, workTgoId));
		return workTgo.work.outputs;
	}
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

const handleCreateWorkInstance = function* ({ payload: { goalTgoId, work }}: ActionType<typeof createWorkInstance>) {
	const s: RootStateType = yield select();
	const goalTgo = s.tgos[goalTgoId];
	if (!isComponentGoal(goalTgo)) return;

	// Add a Work TgoId
	const newWorkAction: ActionType<typeof addTgo> = yield put(addTgo({
		work,
		inventory: [],
	}));

	// Add the WorkTgoId to Goal inventory
	yield put(inventoryAddTgoId(
		goalTgoId,
		newWorkAction.payload.tgo.tgoId
	));

	// Add the WorkTgoId as a goal workInstance.
	yield put(goalAddWorkInstance(goalTgoId, newWorkAction.payload.tgo.tgoId));
}

const workRootSaga = function* () {
	if (!isServer) return;
	yield takeEvery(getType(createWorkInstance), handleCreateWorkInstance);
};

export default workRootSaga;
