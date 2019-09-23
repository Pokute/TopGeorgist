import { select, put, takeEvery, call, all } from "redux-saga/effects";

import { Requirement, isRequirementDelivery, isRequirementMove, RequirementMove, RequirementConsume, RequirementConsumeTypeId, RequirementConsumeTgoId, isRequirementConsume } from "../reducers/goal";
import { RootStateType } from "../reducers";
import { ComponentGoalDoer, hasComponentGoalDoer, isComponentGoal, isComponentWork, ComponentGoal } from "../data/components_new";
import { hasComponentInventory, ComponentInventory, inventoryActions } from "../components/inventory";
import { hasComponentPosition, ComponentPosition } from '../components/position';
import { TgoId, TgoType, TgoRoot } from "../reducers/tgo";
import { moveWork, consumeWork } from "../data/works";
import { Inventory, InventoryItem } from "../components/inventory";
import { transaction } from "../actions/transaction";
import { Work } from "../reducers/work";
import { setPosition } from "../components/position";
import { remove as tgosRemove } from "../actions/tgos";
import { getType } from "typesafe-actions";
import { tick } from "../actions/ticker";
import { positionMatches, getPositionOffset, getPositionDistanceManhattan, MapPosition } from "../reducers/map";
import { createWorkInstance } from "../actions/workInstance";
import { handleWorkInstance } from "./work";
import { removeGoals } from "../actions/goals";
import { removeWorkInstance } from "../actions/goal";
import { TransactionParticipant } from "./transaction";

// const handleGoalRequirementDelivery = function* (actorTgoId: TgoId, requirement: RequirementDelivery) {
// 	const s: RootStateType = yield select();

// 	const targetPosition = typeof requirement.targetPosition === 'string'
// 		? s.tgos[requirement.targetPosition as RequirementDeliveryTargetTgoId]
// 		: requirement.targetPosition as RequirementDeliveryTargetPosition;

// 	const [completeTgoIds, incompleteTgoIds] = ((requirement.tgoIds
// 		.map((deliveryTgoId): [boolean, TgoId?] => {
// 			const deliveryTgo = s.tgos[deliveryTgoId];
// 			if (!deliveryTgo || !hasComponentPosition(deliveryTgo)) {
// 				return [true, undefined]; // Skip deliverytargets that aren't found.
// 			}

// 			let completed = false;
// 			if (deliveryTgo.position.x === requirement.targetPosition.x &&
// 				deliveryTgo.position.y === requirement.targetPosition.y) {
// 				completed = true;
// 			}
// 			return [completed, deliveryTgoId]
// 		})
// 		.filter(([completeTgoIds, incompleteTgoIds]) => incompleteTgoIds !== undefined)) as ReadonlyArray<[boolean, TgoId]>)
// 		.reduce(([completeTgoIds, incompleteTgoIds]: [TgoId[], TgoId[]], [completed, deliveryTgoId]): [TgoId[], TgoId[]] => 
// 			completed
// 				? [[...completeTgoIds, deliveryTgoId], incompleteTgoIds]
// 				: [completeTgoIds, [...incompleteTgoIds, deliveryTgoId]]
// 			, [[], []]);
// }

const completeWorkInput = function* (actorTgoId: TgoId, input: InventoryItem) {
	if (input.typeId === 'tick') {
		if (input.count <= 0)
			return true;
		const getCurrentTick = function*() { return ((yield select()) as RootStateType).ticker.currentTick; }
		const endTick = (yield getCurrentTick()) + input.count;
		while (yield getCurrentTick() < endTick) {
			yield false;
		}
		return true;
	} else {
		const s: RootStateType = yield select();
		const actorTgo = s.tgos[actorTgoId];
		if (!hasComponentInventory(actorTgo)) {
			return false;
		}

		return (actorTgo.inventory.some(i => (i.typeId === input.typeId) && (i.count >= input.count)));
	}
}

const completeWork = function* (actorTgoId: TgoId, work: Work) {
	const inputs = work.actorItemChanges.map(work => completeWorkInput(actorTgoId, work));
	const results: ReadonlyArray<boolean> = yield* inputs;
	if (results.every(i => i)) {
		return transaction({
			tgoId: actorTgoId,
			items: [...work.actorItemChanges, ...work.targetItemChanges],
		});
	}
	return false;
};

const handleGoalRequirementConsumeTypeId = function* (
	actorTgo: ComponentInventory & Partial<ComponentGoalDoer>,
	goalTgo: ComponentGoal & Partial<ComponentInventory>,
	{ consumableTypeId, count }: RequirementConsumeTypeId
) {
	const s: RootStateType = yield select();

	if (count <= 0) {
		return true;
	}
	if (count !== 1)
		throw new Error('handleGoalRequirementConsumeTypeId with count !== 1 is unimplemented.');

	// Convert an item to something temporary that has an inventory of contents.
	if (!hasComponentInventory(goalTgo) || goalTgo.inventory.length === 0) {
		const type = s.itemTypes[consumableTypeId];
		if (!type) return false;
		if (!type.inventory) return false;
		if (!hasComponentInventory(actorTgo)) return false;

		// Check if enough items for actor.
		if (!actorTgo.inventory.find(ii => ii.typeId === consumableTypeId && ii.count >= count)) {
			return false;
		}

		// Remove item from actor's inventory
		yield put(inventoryActions.add(actorTgo.tgoId, consumableTypeId, count * -1));

		yield all(type.inventory.map(ii =>
			put(inventoryActions.add(goalTgo.tgoId, ii.typeId, ii.count))
		));
	}

	const goalComplete = function* (actorTgoId: TgoId, goalTgoId: TgoId) {
		yield put(removeGoals(actorTgoId, [goalTgoId]))

		// Remove Tgo from tgos
		yield put(tgosRemove(goalTgoId))
	}

	// Check goal if there's active work
	if (goalTgo.goal.workInstances.length == 0) {
		const foundWork = consumeWork;
		if (foundWork) {
			const workInstanceAction = yield put(createWorkInstance({goalTgoId: goalTgo.tgoId, work: foundWork, targetTgoId: goalTgo.tgoId}));
			return false; // TODO: Fix that we don't have to exit this function. We need to do a new select() or use the above result.
		} else {
			// give up.

		}
	}

	const actorWithGoals = s.tgos[actorTgo.tgoId];
	if (!hasComponentInventory(actorWithGoals) || !(hasComponentGoalDoer(actorWithGoals))) {
		return false;
	}

	const workInstanceTgo = s.tgos[goalTgo.goal.workInstances[0]];
	if (!isComponentWork(workInstanceTgo)) return false;

	const workOutput: Array<{
		tgoId: TgoId,
		awardItems: Inventory,
	}> | undefined =
		yield* handleWorkInstance(actorWithGoals, goalTgo, workInstanceTgo);
	if (workOutput) {
		const mapped: Array<TransactionParticipant> = workOutput.map(wo => ({ tgoId: wo.tgoId, items: wo.awardItems }));
		yield put(all(transaction(...mapped)));
		return false;
	}
	return false;
};

const handleGoalRequirementConsumeTgoId = function* (actorTgo: ComponentInventory, goalTgoId: ComponentGoal, requirementConsumeTgoId: RequirementConsumeTgoId) {
	throw new Error('Not implemented.');
	return null;
};

const handleGoalRequirementConsume = function* (actorTgo: ComponentInventory, goalTgo: ComponentGoal,  requirement: RequirementConsume) {
	switch (requirement.type) {
		case 'RequirementConsumeTypeId':
			yield* handleGoalRequirementConsumeTypeId(actorTgo, goalTgo, requirement);
			return;
		case 'RequirementConsumeTgoId':
			yield* handleGoalRequirementConsumeTgoId(actorTgo, goalTgo, requirement);
			return;
	}
};

const handleGoalRequirementMove = function* (actorTgo: ComponentPosition, goalTgo: ComponentGoal,  { targetPosition }: RequirementMove) {
	const s: RootStateType = yield select();

	const goalComplete = function* (actorTgoId: TgoId, goalTgoId: TgoId) {
		yield put(removeGoals(actorTgoId, [goalTgoId]))

		// Remove Tgo from tgos
		yield put(tgosRemove(goalTgoId))
	}

	if (positionMatches(actorTgo.position, targetPosition)) {
		// The goal requirement completed.
		yield* goalComplete(actorTgo.tgoId, goalTgo.tgoId);
		return true
	}

	// Check goal if there's active work
	if (goalTgo.goal.workInstances.length == 0) {
		const foundWork = moveWork;
		if (foundWork) {
			const workInstanceAction = yield put(createWorkInstance({ goalTgoId: goalTgo.tgoId, work: foundWork}));
			return false; // TODO: Fix that we don't have to exit this function. We need to do a new select() or use the above result.
		} else {
			// give up.

		}
	}
	const workInstanceTgo = s.tgos[goalTgo.goal.workInstances[0]];
	if (!workInstanceTgo || !isComponentWork(workInstanceTgo)) return false;

	const actorWithGoals = s.tgos[actorTgo.tgoId];
	if (!hasComponentInventory(actorWithGoals) || !(hasComponentGoalDoer(actorWithGoals))) {
		return false;
	}

	const workOutput: { tgoId: TgoId, awardItems: Inventory }[] | undefined = yield* handleWorkInstance(actorWithGoals, goalTgo, workInstanceTgo);
	if (workOutput) {
		// Move the steps towards goal.
		if (workOutput.length == 0)
			return false;
		const actorWorkOutput = workOutput[0].awardItems;
		for (let positionChange = 0; positionChange < (actorWorkOutput.find(ii => ii.typeId == 'position') || { count: 0 }).count; positionChange++) {
			const positionOffset = getPositionOffset(actorTgo.position, targetPosition);
			const currentPos = ((yield select()) as RootStateType).tgos[actorTgo.tgoId]!.position!;
			const change = {
				x: -1 * Math.sign(positionOffset.x),
				y: -1 * Math.sign(positionOffset.y),
			};
			// yield put(res);
			yield put(setPosition(actorTgo.tgoId, { x: currentPos.x + change.x, y: currentPos.y + change.y } as MapPosition));
			if (positionMatches(actorTgo.position, targetPosition)) {
				yield* goalComplete(actorTgo.tgoId, goalTgo.tgoId);
				break;
			}
		}
		yield put(removeWorkInstance(goalTgo.tgoId, workInstanceTgo.tgoId));
		if (positionMatches(actorTgo.position, targetPosition)) {
			yield* goalComplete(actorTgo.tgoId, goalTgo.tgoId);
			return true;
		}
	}
	return false;
};

const handleGoalRequirement = function* (actorTgo: TgoRoot, goalTgo: ComponentGoal, requirement: Requirement) {
	if (isRequirementDelivery(requirement)) {
		// return handleGoalRequirementDelivery(actorTgoId, requirement);
	}
	if (isRequirementMove(requirement) && hasComponentPosition(actorTgo)) {
		yield* handleGoalRequirementMove(actorTgo, goalTgo, requirement);
	}
	if (isRequirementConsume(requirement) && hasComponentInventory(actorTgo)) {
		yield* handleGoalRequirementConsume(actorTgo, goalTgo, requirement);
	}
	return false;
};

const handleGoal = function* (actorTgo: TgoRoot, goalTgo: ComponentGoal) {
	yield* handleGoalRequirement(actorTgo, goalTgo, goalTgo.goal.requirements[0]);
	return true;
};

const handleCancelGoal = function* (actorTgoId: TgoId, goalTgoId: TgoId) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[actorTgoId];
	const goalTgo = s.tgos[goalTgoId];
	if (!isComponentGoal(goalTgo)) return false;

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

	if (!hasComponentInventory(goalTgo) || !hasComponentInventory(actorTgo)) return false;
	const redeemedWorksAction = goalTgo.goal.workInstances.map(workInstanceTgoId => s.tgos[workInstanceTgoId]).filter(hasComponentInventory).map(workIntanceTgo => redeem(actorTgo, workIntanceTgo));
	yield all(redeemedWorksAction.map(a => put(a)))
	yield put(redeem(actorTgo, goalTgo));
}

const handleGoalsForOwner = function* (owner: TgoType & ComponentGoalDoer & ComponentInventory) {
	const s: RootStateType = yield select();
	if (owner.activeGoals.length <= 0) {
		return false;
	}

	const activeGoal = s.tgos[owner.activeGoals[0]];
	if (!isComponentGoal(activeGoal)) return false;

	// yield* handleGoalIds(owner.tgoId, owner.activeGoals[0]);
	yield* handleGoal(owner, activeGoal);
	return true;
}

const handleGoalTick = function* () {
	const s: RootStateType = yield select();
	// console.log(Object.values(s.tgos)[Object.values(s.tgos).length - 1]);
	const goalOwners = Object.values(s.tgos)
		.filter(hasComponentGoalDoer)
		.filter(hasComponentInventory);

	for (const goalOwner of goalOwners) yield call(handleGoalsForOwner, goalOwner);
};

const queueListeners = function* () {
	yield takeEvery(getType(tick), handleGoalTick);
};

export default queueListeners;
