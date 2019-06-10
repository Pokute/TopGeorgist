import { Inventory } from "../components/inventory";
import { TgoId } from "./tgo";

export type Work = {
	readonly type: string,
	readonly actorItemChanges: Inventory,
	readonly targetItemChanges: Inventory,
};
