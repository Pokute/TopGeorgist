import { type TgoType } from '../reducers/tgo.ts';
import { type ComponentLabel } from './label.ts';

export type ComponentUniqueLabel = ComponentLabel & {
	readonly uniqueLabel: true,
}

export const hasComponentUniqueLabel = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentUniqueLabel>) =>
	typeof tgo.uniqueLabel == 'boolean' && tgo.uniqueLabel == true;
