import { select, put, takeEvery, call, all } from "redux-saga/effects";

import { Goal, Requirement, isRequirementDelivery, RequirementDelivery, RequirementDeliveryTargetPosition, RequirementDeliveryTargetTgoId, isRequirementMove, RequirementMove } from "../reducers/goal";
import { RootStateType } from "../reducers";
import { hasComponentPosition, hasComponentInventory, ComponentGoalDoer, hasComponentGoalDoer, ComponentInventory, isComponentGoal, isComponentWork } from "../components_new";
import { TgoId, TgoType } from "../reducers/tgo";
import { moveWork } from "../works";
import { Inventory, InventoryItem } from "../reducers/inventory";
import { transaction } from "../actions/transaction";
import { Work } from "../reducers/work";
import { TransactionActionType } from "./transaction";
import { setPosition } from "../actions/tgo";
import { remove as tgosRemove } from "../actions/tgos";
import { getType } from "typesafe-actions";
import { tick } from "../actions/ticker";
import { MapPosition, positionMatches, getPositionOffset, getPositionDistanceManhattan } from "../reducers/map";
import { createWorkInstance } from "../actions/workInstance";
import { handleWorkInstance } from "./work";
import { removeGoals } from "../actions/goals";

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
	const inputs = work.inputs.map(work => completeWorkInput(actorTgoId, work));
	const results: ReadonlyArray<boolean> = yield* inputs;
	if (results.every(i => i)) {
		return transaction({
			tgoId: actorTgoId,
			items: [...work.inputs, ...work.outputs],
		});
	}
	return false;
};

const handleGoalRequirementMove = function* (actorTgoId: TgoId, goalTgoId: TgoId,  { targetPosition }: RequirementMove) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[actorTgoId];
	const goalTgo = s.tgos[goalTgoId];
	if (!isComponentGoal(goalTgo)) return false;
	if (!actorTgo || !hasComponentPosition(actorTgo)) {
		return false;
	}

	const goalComplete = function* (actorTgoId: TgoId, goalTgoId: TgoId) {
		yield put(removeGoals(actorTgoId, [goalTgoId]))

		// Remove Tgo from tgos
		yield put(tgosRemove(goalTgoId))
	}

	if (positionMatches(actorTgo.position, targetPosition)) {
		// The goal requirement completed.
		yield* goalComplete(actorTgoId, goalTgoId);
		return true
	}

	// Check goal if there's active work
	if (goalTgo.goal.workInstances.length == 0) {
		const foundWork = moveWork;
		if (foundWork) {
			const workInstanceAction = yield put(createWorkInstance({goalTgoId, work: moveWork}));
			return false; // TODO: Fix that we don't have to exit this function. We need to do a new select() or use the above result.
		} else {
			// give up.

		}
	}
	const workInstanceTgo = s.tgos[goalTgo.goal.workInstances[0]];
	if (!isComponentWork(workInstanceTgo)) return false;

	const workOutput: Inventory | undefined = yield* handleWorkInstance(actorTgoId, goalTgoId, workInstanceTgo.tgoId);
	if (workOutput) {
		// Move the steps towards goal.
		for (let positionChange = 0; positionChange < (workOutput.find(ii => ii.typeId == 'position') || { count: 0 }).count; positionChange++) {
			const positionOffset = getPositionOffset(actorTgo.position, targetPosition);
			const currentPos = ((yield select()) as RootStateType).tgos[actorTgoId]!.position!;
			const change = {
				x: -1 * Math.sign(positionOffset.x),
				y: -1 * Math.sign(positionOffset.y),
			};
			// yield put(res);
			yield put(setPosition(actorTgoId, { x: currentPos.x + change.x, y: currentPos.y + change.y }));
			if (positionMatches(actorTgo.position, targetPosition)) {
				yield* goalComplete(actorTgoId, goalTgoId);
				return true;
			}
		}
	}
	return false;
};

const handleGoalRequirement = function* (actorTgoId: TgoId, goalTgoId: TgoId, requirement: Requirement) {
	if (isRequirementDelivery(requirement)) {
		// return handleGoalRequirementDelivery(actorTgoId, requirement);
	}
	if (isRequirementMove(requirement)) {
		yield* handleGoalRequirementMove(actorTgoId, goalTgoId, requirement);
	}
};

const handleGoal = function* (actorTgoId: TgoId, goalTgoId: TgoId) {
	const s: RootStateType = yield select();
	const goalTgo = s.tgos[goalTgoId];
	if (!isComponentGoal(goalTgo)) return false;
	if (goalTgo.goal.requirements.length !== 1) {
		return false;
	}
	yield* handleGoalRequirement(actorTgoId, goalTgo.tgoId, goalTgo.goal.requirements[0]);
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
	if (owner.activeGoals.length <= 0) {
	 	return false;
	}
	yield* handleGoal(owner.tgoId, owner.activeGoals[0]);
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
