import { select, put, takeEvery, call, all } from "redux-saga/effects";

import { Goal, Requirement, isRequirementDelivery, RequirementDelivery, RequirementDeliveryTargetPosition, RequirementDeliveryTargetTgoId, isRequirementMove, RequirementMove } from "../reducers/goal";
import { RootStateType } from "../reducers";
import { hasComponentPosition, hasComponentInventory, ComponentGoalDoer, hasComponentGoalDoer, ComponentInventory, isComponentGoal } from "../components_new";
import { TgoId, TgoType } from "../reducers/tgo";
import { moveWork } from "../works";
import { InventoryItem } from "../reducers/inventory";
import { transaction } from "../actions/transaction";
import { Work } from "../reducers/work";
import { TransactionActionType } from "./transaction";
import { setPosition } from "../actions/tgo";
import { getType } from "typesafe-actions";
import { tick } from "../actions/ticker";
import { MapPosition, positionMatches, getPositionOffset } from "../reducers/map";

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

const handleGoalRequirementMove = function* (actorTgoId: TgoId, { targetPosition }: RequirementMove) {
	const s: RootStateType = yield select();
	const actorTgo = s.tgos[actorTgoId];
	if (!actorTgo || !hasComponentPosition(actorTgo)) {
		return false;
	}

	let failed = false;
	let positionOffset: MapPosition;
	while (positionOffset = getPositionOffset(actorTgo.position, targetPosition), (positionOffset.x + positionOffset.y >= 0) || failed) {
		const res: (ReturnType<typeof transaction> | false) = yield* completeWork(actorTgoId, moveWork);
		if (res !== false) {
			// Move a step.
			const posChange = res.payload.participants[0].items.find(i => i.typeId === 'position');
			if (!posChange) {
				return false;
			}
			const currentPos = ((yield select()) as RootStateType).tgos[actorTgoId]!.position!;
			const change = {
				x: Math.sign(positionOffset.x),
				y: Math.sign(positionOffset.y),
			};
			yield put(res);
			yield put(setPosition(actorTgoId, { x: currentPos.x + change.x, y: currentPos.y + change.y }));
		} else {
			// We failed requirements!
			return false;
		}
	}
	return true;
};

const handleGoalRequirement = function* (actorTgoId: TgoId, requirement: Requirement) {
	if (isRequirementDelivery(requirement)) {
		// return handleGoalRequirementDelivery(actorTgoId, requirement);
	}
	if (isRequirementMove(requirement)) {
		return handleGoalRequirementMove(actorTgoId, requirement);
	}
};

const handleGoal = function* (actorTgoId: TgoId, goalTgoId: TgoId) {
	const s: RootStateType = yield select();
	const goalTgo = s.tgos[goalTgoId];
	if (!isComponentGoal(goalTgo)) return false;
	if (goalTgo.goal.requirements.length !== 1) {
		return false;
	}
	yield* handleGoalRequirement(actorTgoId, goalTgo.goal.requirements[0]);
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
	if (owner.activeGoals.length !== 1) {
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
