import { InventoryItem } from "./inventory";

export type Work = {
	readonly inputs: ReadonlyArray<InventoryItem>,
	readonly outputs: ReadonlyArray<InventoryItem>,
};
