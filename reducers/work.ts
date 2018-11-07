import { InventoryItem } from "./inventory";

export type Work = {
	inputs: ReadonlyArray<InventoryItem>,
	outputs: ReadonlyArray<InventoryItem>,
};
