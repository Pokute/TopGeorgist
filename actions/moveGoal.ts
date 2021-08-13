import { createAction } from 'typesafe-actions';

import { TgoId, TgoType } from '../reducers/tgo.js';
import { TypeId } from '../reducers/itemType.js';
import { MapPosition } from '../concerns/map.js';

export const moveGoal = createAction('TGO_GOAL_CREATE_MOVE',
	(ownerTgoId: TgoId, position: MapPosition) => ({
		tgoId: ownerTgoId,
		position,
	})
)();
