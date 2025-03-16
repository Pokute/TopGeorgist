import { type TgoType } from '../reducers/tgo.ts';
import { type ComponentLabel } from './label.ts';
import { type ComponentUniqueLabel } from './uniqueLabel.ts';

export type ComponentPlayer = ComponentLabel & ComponentUniqueLabel & {
	readonly player: true,
}

export const hasComponentPlayer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPlayer>) =>
	tgo?.player !== undefined && tgo?.player === true;
