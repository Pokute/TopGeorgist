import { type TgoType } from '../reducers/tgo.ts';

export interface ComponentLabel {
	readonly label: string,
}

export const hasComponentLabel = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentLabel>) =>
	tgo && typeof tgo.label !== undefined
