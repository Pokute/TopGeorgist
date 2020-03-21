import { createAction } from 'typesafe-actions';
import { ItemType, TypeId, defaultItemType } from '../reducers/itemType';

export const add = createAction('ITEMTYPE_ADD', (resolve) => {
	return (itemType: Partial<ItemType> & { typeId: TypeId }) => resolve({
		itemType: {
			...defaultItemType,
			...itemType,
		},
	});
});

export const remove = createAction('ITEMTYPE_REMOVE', (resolve) => {
	return (typeId: TypeId) => resolve({
		typeId,
	});
});
