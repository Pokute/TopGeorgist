import { createAction } from "typesafe-actions";

import { TgoId, TgoType } from "../reducers/tgo";
import { TypeId } from "../reducers/itemType";

export const add = createAction('TGO_INVENTORY_ADD', (resolve) => {
	return (ownerTgoId: TgoId, typeId: TypeId, count: number = 1) => resolve({
		tgoId: ownerTgoId,
		item: {
			typeId,
			count,
		},
	});
});