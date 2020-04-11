import { createAction } from 'typesafe-actions';
import { ItemType, TypeId, defaultItemType } from '../reducers/itemType';

export const add = createAction('ITEMTYPE_ADD',
	(itemType: Partial<ItemType> & { typeId: TypeId }) => ({
		itemType: {
			...defaultItemType,
			...itemType,
		},
	})
)();

export const remove = createAction('ITEMTYPE_REMOVE',
	(typeId: TypeId) => ({
		typeId,
	})
)();
