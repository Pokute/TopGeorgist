import { createAction } from 'typesafe-actions';

import { type ItemType, type TypeId, defaultItemType } from '../reducers/itemType.ts';
import { type ItemTypesState } from '../reducers/itemTypes.ts';

export const setAll = createAction('ITEMTYPES_SET',
	(itemTypes: ItemTypesState) => ({
		itemTypes,
	})
)();

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
