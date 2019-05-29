import { Inventory } from "../components/inventory";
import { TgoId } from "./tgo";

export type Work = {
	readonly type: string,
	readonly targetTgoId?: TgoId,
	readonly actorItemChanges: Inventory,
	readonly targetItemChanges: Inventory,
};
