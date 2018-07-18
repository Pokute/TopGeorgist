import { createAction } from 'typesafe-actions';
import { TgoId } from '../reducers/tgo';
import { TypeId } from '../reducers/itemType';

export const consume = createAction('CONSUMABLE_CONSUME', resolve => {
	return (actorTgoId: TgoId, targetTypeId: TypeId) => resolve({
		actorTgoId,
		targetTypeId,
	});
});

export const intoSeeds = createAction('CONSUMABLE_INTO_SEEDS', resolve => {
	return (actorTgoId: TgoId, targetTypeId: TypeId) => resolve({
		actorTgoId,
		targetTypeId,
	});
});
