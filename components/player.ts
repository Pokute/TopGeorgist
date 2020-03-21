import { TgoType } from "../reducers/tgo";
import { ComponentLabel } from "./label";
import { ComponentUniqueLabel } from "./uniqueLabel";

export type ComponentPlayer = ComponentLabel & ComponentUniqueLabel & {
	readonly player: true,
}

export const hasComponentPlayer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPlayer>) =>
	tgo?.player !== undefined && tgo?.player === true;
