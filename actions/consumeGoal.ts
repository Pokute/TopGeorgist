import { createAction } from "typesafe-actions";

import { TgoId } from "../reducers/tgo";
import { TypeId } from "../reducers/itemType";

export const consumeGoal = createAction('TGO_GOAL_CREATE_CONSUME',
	(ownerTgoId: TgoId, targetTypeId: TypeId, count: number) => ({
		tgoId: ownerTgoId,
		targetTypeId,
		count,
	})
)();
