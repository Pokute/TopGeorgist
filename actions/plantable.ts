import { createAction } from 'typesafe-actions';
import { TgoId } from '../reducers/tgo';
import { TypeId } from '../reducers/itemType';

export const plant = createAction('PLANT', resolve => {
	return (actorTgoId: TgoId, targetTypeId: TypeId) => resolve({
		actorTgoId,
		targetTypeId,
	});
});

export const harvest = createAction('HARVEST', resolve => {
	return (actorTgoId: TgoId, targetTgoId: TgoId) => resolve({
		actorTgoId,
		targetTgoId,
	});
});
