import { TgoType } from "../reducers/tgo";

export interface ComponentPlayer {
	readonly player: true,
}

export const hasComponentPlayer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPlayer>) =>
	tgo && (tgo.player !== undefined && tgo.player === true)
