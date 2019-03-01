import { InventoryItem } from "./inventory";
import { TgoId } from "./tgo";

export type RequirementDeliveryTargetTgoId = TgoId;
export type RequirementDeliveryTargetPosition = {
	readonly x: number,
	readonly y: number,
};

export type RequirementDeliveryTarget = RequirementDeliveryTargetPosition | RequirementDeliveryTargetTgoId;

export interface RequirementDelivery {
	readonly type: 'RequirementDelivery',
	readonly targetPosition: RequirementDeliveryTarget,
	readonly tgoIds: ReadonlyArray<TgoId>,
	readonly inventoryItems: ReadonlyArray<InventoryItem>,
};

export interface RequirementIntentoryItems {
	readonly type: 'RequirementInventoryItems',
	readonly inventoryItems: ReadonlyArray<InventoryItem>,
}

export interface RequirementMove {
	readonly type: 'RequirementMove',
	readonly targetPosition: RequirementDeliveryTargetPosition,
};

export type Requirement =
	RequirementIntentoryItems // We need to acquire items to complete
	| RequirementDelivery // We must deliver something somewhere
	| RequirementMove // Simplified requirement for testing
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

export type Goal = {
	readonly title?: string,
	readonly requirements: ReadonlyArray<Requirement>,
	readonly progress: number,
};
