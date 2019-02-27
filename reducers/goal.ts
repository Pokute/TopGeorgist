import { InventoryItem } from "./inventory";
import { TgoId } from "./tgo";

export type RequirementDeliveryTargetTgoId = TgoId;
export type RequirementDeliveryTargetPosition = {
	readonly x: number,
	readonly y: number,
};

export type RequirementDeliveryTarget = RequirementDeliveryTargetPosition | RequirementDeliveryTargetTgoId;

export type RequirementDelivery = {
	readonly type: 'RequirementDelivery',
	readonly targetPosition: RequirementDeliveryTarget,
	readonly tgoIds: ReadonlyArray<TgoId>,
	readonly inventoryItems: ReadonlyArray<InventoryItem>,
};

export type Requirement =
	InventoryItem |
	RequirementDelivery;

export function isRequirementDelivery(requirement: Requirement): requirement is RequirementDelivery {
	const requirementDelivery = requirement as RequirementDelivery;
	return (requirementDelivery.targetPosition !== undefined && (
		(requirementDelivery.tgoIds && requirementDelivery.tgoIds.length > 0) ||
		(requirementDelivery.inventoryItems && requirementDelivery.inventoryItems.length > 0)
	));
};

export type Goal = {
	readonly title?: string,
	readonly requirements: ReadonlyArray<Requirement>,
	readonly progress: number,
};
