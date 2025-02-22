import { ItemTypesState } from './itemTypes.js';
import { Inventory } from '../concerns/inventory.js';
import { Opaque } from '../typings/global.d.js';

// export type TypeId = keyof ItemTypesState;
export type TypeId = Opaque<string, 'TypeId'>;

export type OptionalFields = {
	readonly label?: string,
	readonly building?: boolean,
	readonly deployable?: {
		readonly deployInventory: Inventory,
		readonly deployVerb?: string,
		readonly collectVerb?: string,
		readonly deployAdditionals?: any,
	},
	readonly isTgoId?: boolean,
	readonly inventory?: Inventory,
};

export type InitialItemType = OptionalFields & Partial<Omit<RequiredFields, 'typeId'>>;

export interface RequiredFields {
	readonly typeId: TypeId,
	readonly stackable: boolean, // Whether there can be more than 1
	readonly positiveOnly: boolean,
	readonly isInteger: boolean, // Whether there can be 1,2,3,4 or 1.2, 2.1, 3.05
	readonly isStorable: boolean, // Whether this can be stored in non-virtual inventories.
	readonly redeemable: boolean, // Whether this will be redeemed on work cancellation to source inventories.
	readonly collectable: boolean, // Whether when collecting a deployable, it's collected too.
};

export type ItemType = OptionalFields & RequiredFields;

export const defaultItemType: Omit<RequiredFields, 'typeId'> = {
	stackable: true,
	positiveOnly: true,
	isInteger: false,
	isStorable: true,
	redeemable: true,
	collectable: true,
} as const;

const initialState: ItemType = {
	...defaultItemType,
	typeId: '' as TypeId,
};

// Itemtypes should not be modifiable during runtime.
export default (state = initialState) : ItemType => state;

export { initialState };
