import { select } from "redux-saga/effects";

import { Goal, Requirement, isRequirementDelivery, RequirementDelivery, RequirementDeliveryTargetPosition, RequirementDeliveryTargetTgoId } from "../reducers/goal";
import { RootStateType } from "../reducers";

const handleGoalRequirementDelivery = function* (requirement: RequirementDelivery) {
	const s: RootStateType = yield select();

	const targetPosition = typeof requirement.targetPosition === 'string'
		? s.tgos[requirement.targetPosition as RequirementDeliveryTargetTgoId]
		: requirement.targetPosition as RequirementDeliveryTargetPosition;

	requirement.tgoIds.forEach(deliveryTgoId => {
		const deliveryTgo = s.tgos[deliveryTgoId];

		if (deliveryTgo.position.x === requirement.targetPosition.x &&
			deliveryTgo.position.y === requirement.targetPosition.y)
	})
}

const handleGoalRequirement = function* (requirement: Requirement) {
	if (isRequirementDelivery(requirement)) {
		return handleGoalRequirementDelivery(requirement);
	}
};

const handleGoal = function* (goal: Goal) {
	goal.requirements.forEach(requirement => {
		await handleGoalRequirement(requirement);
	});
	if (goal.requirements.length > 0) 
};
