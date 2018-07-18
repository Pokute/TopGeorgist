import { createAction } from 'typesafe-actions';
import { TgoId } from '../reducers/tgo';
import { TypeId } from '../reducers/itemType';

export const plant = createAction('PLANT', resolve => {
	return (actorTgoId: TgoId, plantableTypeId: TypeId) => resolve({
		actorTgoId,
		plantableTypeId,
	});
});

export const harvest = createAction('HARVEST', resolve => {
	return (actorTgoId: TgoId, targetTgoId: TgoId) => resolve({
		actorTgoId,
		targetTgoId,
	});
});
