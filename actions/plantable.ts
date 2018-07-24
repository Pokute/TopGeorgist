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
	return (tgoId: TgoId, visitableTgoId: TgoId) => resolve({
		tgoId,
		visitableTgoId,
	});
});
