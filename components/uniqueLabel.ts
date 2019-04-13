import { TgoType } from '../reducers/tgo';
import { ComponentLabel } from './label';

export type ComponentUniqueLabel = ComponentLabel & {
	readonly uniqueLabel: true,
}

export const hasComponentUniqueLabel = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentUniqueLabel>) =>
	typeof tgo.uniqueLabel == 'boolean' && tgo.uniqueLabel == true;
