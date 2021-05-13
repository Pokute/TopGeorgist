import { TgoType } from '../reducers/tgo.js';
import { ComponentLabel } from './label.js';
import { ComponentUniqueLabel } from './uniqueLabel.js';

export type ComponentPlayer = ComponentLabel & ComponentUniqueLabel & {
	readonly player: true,
}

export const hasComponentPlayer = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPlayer>) =>
	tgo?.player !== undefined && tgo?.player === true;
