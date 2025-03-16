import { createAction } from 'typesafe-actions';

import { type TgoId, type TgoType } from '../reducers/tgo.ts';
import { type TypeId } from '../reducers/itemType.ts';
import { type MapPosition } from '../concerns/map.ts';

export const moveGoal = createAction('TGO_GOAL_CREATE_MOVE',
	(ownerTgoId: TgoId, position: MapPosition) => ({
		tgoId: ownerTgoId,
		position,
	})
)();
