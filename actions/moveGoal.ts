import { createAction } from "typesafe-actions";

import { TgoId, TgoType } from "../reducers/tgo";
import { TypeId } from "../reducers/itemType";
import { MapPosition } from "../reducers/map";

export const moveGoal = createAction('TGO_GOAL_CREATE_MOVE',
	(ownerTgoId: TgoId, position: MapPosition) => ({
		tgoId: ownerTgoId,
		position,
	})
)();
