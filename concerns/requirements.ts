import { hasComponentPosition } from '../components/position';
import { TypeId } from '../reducers/itemType';
import { TgoId } from '../reducers/tgo';
import tgosReducer, { TgosState } from '../reducers/tgos';
import { ComponentGoal, ComponentGoalDoer } from './goal';
import { ComponentInventory, hasComponentInventory, inventory, Inventory } from './inventory';
import { mapPosition, MapPosition } from './map';
import { autoCommittedItemsInventory, ComponentWorkDoer, ComponentWorkIssuer, workIssuerCreateWorksOnRequiredItems, WorkTargetInventory } from './work';
import { add as addTgo, remove as removeTgo } from './tgos';

export type RequirementDeliveryTargetTgoId = TgoId;
export type RequirementDeliveryTargetPosition = MapPosition;

export type RequirementDeliveryTarget = RequirementDeliveryTargetPosition | RequirementDeliveryTargetTgoId;

export type RequirementBase<T extends string> = {
	readonly type: T;
};

export type RequirementAcquireInventoryItems = RequirementBase<'RequirementAcquireInventoryItems'> & {
	readonly inventoryItems: Inventory;
	readonly producedItemsCountInventoryTgoId?: TgoId;
};

export type RequirementKeepMinimumInventoryItems = RequirementBase<'RequirementKeepMinimumInventoryItems'> & {
	readonly inventoryItems: Inventory;
	readonly completeOnMinimumReached?: boolean;
};

export type RequirementMove = RequirementBase<'RequirementMove'> & {
	targetPosition: MapPosition;
};
// export type RequirementDeliveryTargetTgoId = TgoId;
// export type RequirementDeliveryTargetPosition = MapPosition;
// export type RequirementDeliveryTarget = RequirementDeliveryTargetPosition | RequirementDeliveryTargetTgoId;
// export interface RequirementDelivery {
// 	readonly type: 'RequirementDelivery',
// 	readonly targetPosition: RequirementDeliveryTarget,
// 	readonly tgoIds: ReadonlyArray<TgoId>,
// 	readonly inventoryItems: Inventory,
// };


export type Requirement = RequirementAcquireInventoryItems // We need to acquire items to complete
	|
	RequirementKeepMinimumInventoryItems // We need to keep a minimum amount of items
	|
	RequirementMove // Simplified requirement for testing
	;

export const isRequirementInventoryItems = (requirement?: Requirement): requirement is RequirementAcquireInventoryItems => requirement?.type === 'RequirementAcquireInventoryItems';

export const isRequirementKeepMinimumInventoryItems = (requirement?: Requirement): requirement is RequirementKeepMinimumInventoryItems => requirement?.type === 'RequirementKeepMinimumInventoryItems';

export const isRequirementMove = (requirement?: Requirement): requirement is RequirementMove => requirement?.type === 'RequirementMove';

// export function isRequirementDelivery(requirement: Requirement): requirement is RequirementDelivery {
// 	const requirementDelivery = requirement as RequirementDelivery;
// 	return (requirementDelivery.targetPosition !== undefined && (
// 		(requirementDelivery.tgoIds && requirementDelivery.tgoIds.length > 0) ||
// 		(requirementDelivery.inventoryItems && requirementDelivery.inventoryItems.length > 0)
// 	));
// };

export const getRequirementItems = (requirement: Requirement): Inventory => {
	switch (requirement.type) {
		case 'RequirementAcquireInventoryItems':
		case 'RequirementKeepMinimumInventoryItems':
			return requirement.inventoryItems;
		case 'RequirementMove':
			return [{ typeId: 'movementAmount' as TypeId, count: 1 }];
		default:
			return [];
	}
}

export const getRequirementProducedItems = (tgosState: TgosState, requirement: Requirement, goalDoer: ComponentGoalDoer & ComponentInventory): Inventory => {
	switch (requirement.type) {
		case 'RequirementAcquireInventoryItems':
			if (requirement.producedItemsCountInventoryTgoId === undefined)
				return [];
			const producedItemsCountInventory = tgosState[requirement.producedItemsCountInventoryTgoId];
			return producedItemsCountInventory?.inventory ?? [];
		case 'RequirementKeepMinimumInventoryItems':
			return goalDoer.inventory ?? [];
		default:
			return [];
	}
}

export const requirementIsCompleted = (tgosState: TgosState, goalDoer: ComponentGoalDoer, requirement: Requirement): boolean => {
	switch (requirement.type) {
		case 'RequirementAcquireInventoryItems':
			if (!hasComponentInventory(goalDoer))
				return false;
			return (inventory.combined([
				...getRequirementItems(requirement),
				...inventory.negated(getRequirementProducedItems(tgosState, requirement, goalDoer))
			]).every(ii => ii.count <= 0));
		case 'RequirementKeepMinimumInventoryItems':
			if (!hasComponentInventory(goalDoer) || !requirement.completeOnMinimumReached)
				return false;
			return (inventory.combined([
				...getRequirementItems(requirement),
				...inventory.negated(goalDoer.inventory)
			]).every(ii => ii.count <= 0));
		case 'RequirementMove': {
			if (!hasComponentPosition(goalDoer)) return false;
			return (mapPosition.matching(goalDoer.position, requirement.targetPosition));
		}
		default:
			return false;
	}
};

export const cleanupRequirement = (tgosState: TgosState, requirement: Requirement): TgosState => {
	switch (requirement.type) {
		case 'RequirementAcquireInventoryItems':
			if (requirement.producedItemsCountInventoryTgoId === undefined)
				return tgosState;
			const producedItemsCountInventory = tgosState[requirement.producedItemsCountInventoryTgoId];
			if (producedItemsCountInventory?.inventory === undefined)
				return tgosState;
			return Object.fromEntries(
				Object.entries(tgosState)
					.filter(([tgoId]) => tgoId !== requirement.producedItemsCountInventoryTgoId)
			);
		case 'RequirementKeepMinimumInventoryItems':
		case 'RequirementMove':
		default:
			return tgosState;
	}
};

export const requirementWorkIssuer = (tgosState: TgosState, requirement: Requirement, missingInput: Inventory, currentGoalTgo: ComponentGoal, workIssuer: ComponentWorkIssuer, workDoerTgo: ComponentWorkDoer): TgosState => {
	let targetInventory: WorkTargetInventory | undefined = undefined;
	let counterInventories: Array<TgoId> = [];
	let tgosState2 = tgosState;
	switch (requirement.type) {
		case 'RequirementAcquireInventoryItems':
			let requirement2: RequirementAcquireInventoryItems | undefined = requirement;
			if (requirement.producedItemsCountInventoryTgoId === undefined) {
				const addTgoWithId = (...params: Parameters<typeof addTgo>): [ReturnType<typeof addTgo>, TgoId] => {
					const addTgoAction = addTgo(...params);
					return [addTgoAction, addTgoAction.payload.tgo.tgoId];
				};
				const [CountInvTgo, CountInvTgoId] = addTgoWithId({
					inventory: [],
					inventoryIsPhysical: false,
					inventoryIsStorableOnly: false,
				} as Omit<ComponentInventory, 'tgoId'>);
				tgosState2 = tgosReducer(tgosState2, CountInvTgo);
				tgosState2 = {
					...tgosState2,
					[currentGoalTgo.tgoId]: {
						...currentGoalTgo,
						goal: {
							...currentGoalTgo.goal,
							requirements: currentGoalTgo.goal.requirements.map(req => requirement
								? {
									...req,
									producedItemsCountInventoryTgoId: CountInvTgoId,
								}
								: req
							),
						},
					},
				};
				const tempReq = tgosState2[currentGoalTgo.tgoId].goal?.requirements.find(req => req.type === 'RequirementAcquireInventoryItems'); 
				if (!isRequirementInventoryItems(tempReq)) return tgosState;
				requirement2 = tempReq;
			}

			targetInventory = workDoerTgo.tgoId;
			counterInventories = [requirement2.producedItemsCountInventoryTgoId!];
			break;
		case 'RequirementKeepMinimumInventoryItems':
			targetInventory = workDoerTgo.tgoId;
			break;
		case 'RequirementMove':
			if (!hasComponentPosition(workDoerTgo)) return tgosState;
			if (!missingInput.some(ii => ii.typeId === 'movementAmount')) return tgosState;
			targetInventory = autoCommittedItemsInventory;
			break;
		default:
			return tgosState;
	}

	return workIssuerCreateWorksOnRequiredItems(tgosState2, workIssuer.tgoId, missingInput, workDoerTgo.tgoId, targetInventory, counterInventories);
};
