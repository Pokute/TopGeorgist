import { createAction } from 'typesafe-actions';
import { ItemType, TypeId } from '../reducers/itemType';

export const add = createAction('ITEMTYPE_ADD', (resolve) => {
	return (itemType: ItemType) => resolve({
		itemType,
	});
});

export const remove = createAction('ITEMTYPE_REMOVE', (resolve) => {
	return (typeId: TypeId) => resolve({
		typeId,
	});
});
