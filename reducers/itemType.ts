import { type ItemTypesState } from './itemTypes.ts';
import { type Inventory } from '../concerns/inventory.ts';
import type { Opaque } from '../typings/global.d.ts';
import { type DeployableType } from '#tg/concerns/deployable.ts';

// export type TypeId = keyof ItemTypesState;
export type TypeId = Opaque<string, 'TypeId'>;

export interface RequiredFields {
	readonly typeId: TypeId,
	readonly stackable: boolean, // Whether there can be more than 1
	readonly positiveOnly: boolean,
	readonly isInteger: boolean, // Whether there can be 1,2,3,4 or 1.2, 2.1, 3.05
	readonly isStorable: boolean, // Whether this can be stored in non-virtual inventories.
	readonly redeemable: boolean, // Whether this will be redeemed on work cancellation to source inventories.
	readonly collectable: boolean, // Whether when collecting a deployable, it's collected too.
};

export type OptionalFields = {
	readonly label?: string,
	readonly deployable?: DeployableType,
	readonly isTgoId?: boolean,
	readonly inventory?: Inventory,
};

export type InitialItemType = OptionalFields & Partial<Omit<RequiredFields, 'typeId'>>;
export type ItemType = OptionalFields & RequiredFields;

export const defaultItemType: Omit<RequiredFields, 'typeId'> = {
	stackable: true,
	positiveOnly: true,
	isInteger: true,
	isStorable: true,
	redeemable: true,
	collectable: true,
} as const;

const initialState: ItemType = {
	...defaultItemType,
	typeId: '' as TypeId,
};

// Itemtypes should not be modifiable during runtime. At least at this point.
// In the future, runtime modifiable item types could be a thing.
export default (state = initialState) : ItemType => state;

export { initialState };
