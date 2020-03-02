import { Inventory } from "../components/inventory";
import { TgoId } from "./tgo";

export type Recipe = {
	readonly type: string,
	readonly actorItemChanges: Inventory,
	readonly targetItemChanges: Inventory,
};
