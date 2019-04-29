import { Inventory } from "../components/inventory";

export type Work = {
	readonly type: string,
	readonly actorItemChanges: Inventory,
	readonly targetItemChanges: Inventory,
};
