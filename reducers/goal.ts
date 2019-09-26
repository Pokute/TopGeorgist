import { AnyAction } from "redux";
import { getType, ActionType } from "typesafe-actions";

import { Inventory } from "../components/inventory";
import { TgoId } from "./tgo";
import { MapPosition } from "../reducers/map";
import * as goalActions from '../actions/goal';
import { TypeId } from "./itemType";

export type RequirementDeliveryTargetTgoId = TgoId;
export type RequirementDeliveryTargetPosition = MapPosition;

export type RequirementDeliveryTarget = RequirementDeliveryTargetPosition | RequirementDeliveryTargetTgoId;

export interface RequirementDelivery {
	readonly type: 'RequirementDelivery',
	readonly targetPosition: RequirementDeliveryTarget,
	readonly tgoIds: ReadonlyArray<TgoId>,
	readonly inventoryItems: Inventory,
};

export interface RequirementIntentoryItems {
	readonly type: 'RequirementInventoryItems',
	readonly inventoryItems: Inventory,
}

export interface RequirementMove {
	readonly type: 'RequirementMove',
	readonly targetPosition: RequirementDeliveryTargetPosition,
};

export interface RequirementConsumeTypeId {
	readonly type: 'RequirementConsumeTypeId',
	readonly consumableTypeId: TypeId,
	readonly count: number,
}

export interface RequirementConsumeTgoId {
	readonly type: 'RequirementConsumeTgoId',
	readonly consumableTgoId: TgoId,
}

export type RequirementConsume =
	RequirementConsumeTypeId
	| RequirementConsumeTgoId;

export type Requirement =
	RequirementIntentoryItems // We need to acquire items to complete
	| RequirementDelivery // We must deliver something somewhere
	| RequirementMove // Simplified requirement for testing
	| RequirementConsume // Requirement of consuming item/items.
;

export function isRequirementDelivery(requirement: Requirement): requirement is RequirementDelivery {
	const requirementDelivery = requirement as RequirementDelivery;
	return (requirementDelivery.targetPosition !== undefined && (
		(requirementDelivery.tgoIds && requirementDelivery.tgoIds.length > 0) ||
		(requirementDelivery.inventoryItems && requirementDelivery.inventoryItems.length > 0)
	));
};

export const isRequirementMove = (requirement: Requirement): requirement is RequirementMove =>
	requirement.type === 'RequirementMove'

export const isRequirementConsume = (requirement: Requirement): requirement is RequirementConsume =>
	(requirement.type === 'RequirementConsumeTypeId') || (requirement.type === 'RequirementConsumeTgoId')

export type Goal = {
	readonly title?: string,
	readonly requirements: ReadonlyArray<Requirement>,
	readonly workInstances: ReadonlyArray<TgoId>,
};

export type GoalActionType = ActionType<typeof goalActions>

export default (state: Goal, action: GoalActionType): Goal => {
	switch (action.type) {
		case getType(goalActions.addWorkInstance):
			return {
				...state,
				workInstances: [...state.workInstances, action.payload.workInstanceTgoId]
			};
		case getType(goalActions.removeWorkInstance):
			return {
				...state,
				workInstances: state.workInstances.filter(wi => wi !== action.payload.workInstanceTgoId),
			};
		default:
			return state;
	}
};
