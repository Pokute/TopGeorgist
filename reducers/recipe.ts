import { Inventory } from "../components/inventory";
import { TgoId } from "./tgo";

export type Recipe = {
	readonly type: string,
	readonly input: Inventory,
	readonly output: Inventory,
};
