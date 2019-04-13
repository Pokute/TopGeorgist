import { Inventory } from "../components/inventory";

export type Work = {
	readonly type: string,
	readonly inputs: Inventory,
	readonly outputs: Inventory,
};
