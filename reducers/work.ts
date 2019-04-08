import { InventoryItem } from "./inventory";

export type Work = {
	readonly type: string,
	readonly inputs: ReadonlyArray<InventoryItem>,
	readonly outputs: ReadonlyArray<InventoryItem>,
};
