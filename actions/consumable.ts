import { createAction } from 'typesafe-actions';
import { TgoId } from '../reducers/tgo.js';
import { TypeId } from '../reducers/itemType.js';

export const consume = createAction('CONSUMABLE_CONSUME',
	(actorTgoId: TgoId, targetTypeId: TypeId) => ({
		actorTgoId,
		targetTypeId,
	})
)();

export const intoSeeds = createAction('CONSUMABLE_INTO_SEEDS',
	(actorTgoId: TgoId, targetTypeId: TypeId) => ({
		actorTgoId,
		targetTypeId,
	})
)();
