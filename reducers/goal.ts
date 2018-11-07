import { InventoryItem } from "./inventory";
import { TgoId } from "./tgo";

export type RequirementDeliveryTargetTgoId = TgoId;
export type RequirementDeliveryTargetPosition = {
	x: number,
	y: number,
};

export type RequirementDeliveryTarget = RequirementDeliveryTargetPosition | RequirementDeliveryTargetTgoId;

export type RequirementDelivery = {
	type: 'RequirementDelivery',
	targetPosition: RequirementDeliveryTarget,
	tgoIds: Array<TgoId>,
	inventoryItems: Array<InventoryItem>,
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
	title?: string,
	requirements: Array<Requirement>,
	progress: number,
};
