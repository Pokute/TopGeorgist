import { TgoType, TgoRoot, TgoId } from '../reducers/tgo.js';
import { ItemType, TypeId } from '../reducers/itemType.js';
import { ComponentInventory, InventoryItem } from './inventory.js';
import { transaction, transactionReducer } from './transaction.js';
import { ItemTypesState } from '../reducers/itemTypes.js';
import { put, takeEvery } from 'typed-redux-saga';
import { ActionType, createAction, getType } from 'typesafe-actions';
import { select } from '../redux-saga-helpers.js';
import { TgosState } from './tgos.js';
import { RootStateType } from '../reducers/index.js';

export const consumerActions = {
	consume: createAction('CONSUMER_CONSUME',
		({ tgoId, consumedItem }: { tgoId: TgoId, consumedItem: InventoryItem }) => ({
			tgoId,
			consumedItem,
		})
	)(),
} as const;

export type ComponentConsumer = TgoRoot & ComponentInventory & {
	readonly consumer: {
		readonly allowList?: ReadonlyArray<TypeId>, // If the object to be consumed has at least one of items in allowList in inventory, it's consumable.
		readonly denyList?: ReadonlyArray<TypeId>, // If the object to be consumed has any of items in denyList in inventory, it's not consumable.
	}
};

export const hasComponentConsumer = <BaseT extends TgoType>(tgo?: BaseT) : tgo is (BaseT & Required<ComponentConsumer>) =>
	tgo?.consumer !== undefined;

export const consumerIsTypeConsumable = (consumer: ComponentConsumer, consumableType: ItemType) =>
	consumableType.inventory
		&& consumableType.inventory.some(ti => consumer.consumer.allowList?.includes(ti.typeId))
		&& consumableType.inventory.every(ti => !consumer.consumer.denyList?.includes(ti.typeId));

export const consumerFilterConsumables = (consumer: ComponentConsumer, itemTypes: ItemTypesState) =>
	consumer.inventory
		.map(ii => ({
			...ii,
			type: itemTypes[ii.typeId],
		}))
		.filter(ii => consumerIsTypeConsumable(consumer, ii.type));

export const createConsumeTransaction = (s: RootStateType, consumer: ComponentConsumer, consumedItem: InventoryItem): ReturnType<typeof transaction> | undefined => {
	const consumedType: ItemType = s.itemTypes[consumedItem.typeId];
	if (!consumedType.inventory || consumedType.inventory.length === 0) return undefined;

	const countFound = consumer.inventory
		.find((ii) => ii.typeId === consumedType.typeId)
		?.count ?? 0;

	const countConsumed = Math.min(countFound, consumedItem.count);
	if (countConsumed <= 0) return undefined;

	if (!consumerIsTypeConsumable(consumer, consumedType)) return undefined;
//	const gainedItems = consumedType.inventory.filter(ii => consumer.consumer.allowList?.includes(ii.typeId)); // all items.
	const gainedItems = consumedType.inventory; // Only allowList items.
	if (gainedItems.length === 0) return undefined;

	return transaction({
		tgoId: consumer.tgoId,
		items: [
			{
				typeId: consumedType.typeId,
				count: -countConsumed,
			},
			...(gainedItems.map(gii => ({
				...gii,
				count: gii.count * countConsumed,
			})))
		]
	});
};

export const consumeReducer = (s: RootStateType, { payload: { tgoId: actorTgoId, consumedItem }}: ActionType<typeof consumerActions.consume>): RootStateType => {
	const consumer = s.tgos[actorTgoId];
	if (!consumer || !hasComponentConsumer(consumer))
		return s;

	if (!consumedItem.typeId) throw new Error(`Trying to consume item without a typeId. TgoId: ${consumedItem.tgoId}`);

	const consumeTransaction = createConsumeTransaction(s, consumer, consumedItem);
	if (!consumeTransaction) return s;

	return {
		...s,
		tgos: transactionReducer(
			s.tgos,
			s.itemTypes,
			consumeTransaction
		),
	};
};
