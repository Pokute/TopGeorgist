import { createAction } from 'typesafe-actions';
import { TgoId } from '../reducers/tgo';
import { TypeId } from '../reducers/itemType';

export const plant = createAction('PLANT',
	(actorTgoId: TgoId, targetTypeId: TypeId) => ({
		actorTgoId,
		targetTypeId,
	})
)();

export const harvest = createAction('HARVEST',
	(tgoId: TgoId, visitableTgoId: TgoId, plantTypeId: TypeId) => ({
		tgoId,
		visitableTgoId,
		plantTypeId,
	})
)();
