import { ItemTypesState } from './itemTypes.js';
import { Inventory } from '../concerns/inventory.js';
import { Opaque } from '../typings/global.d.js';

// export type TypeId = keyof ItemTypesState;
export type TypeId = Opaque<string, 'TypeId'>;

type OptionalFields = {
	readonly label?: string,
	readonly building?: boolean,
	readonly deployable?: boolean,
	readonly growsIntoTypeId?: TypeId,
	readonly isTgoId?: boolean,
	readonly inventory?: Inventory,
};

export type InitialItemType = OptionalFields & Partial<Omit<RequiredFields, 'typeId'>>;

export interface RequiredFields {
	readonly typeId: TypeId,
	readonly stackable: boolean,
	readonly positiveOnly: boolean,
	readonly isInteger: boolean,
	readonly isStorable: boolean,
	readonly redeemable: boolean,
};

export type ItemType = OptionalFields & RequiredFields;

export const defaultItemType: Pick<ItemType, 'stackable' | 'positiveOnly' | 'isInteger' | 'isStorable' | 'redeemable'> = {
	stackable: true,
	positiveOnly: true,
	isInteger: false,
	isStorable: true,
	redeemable: true,
} as const;

const initialState: ItemType = {
	...defaultItemType,
	typeId: '' as TypeId,
};

// Itemtypes should not be modifiable during runtime.
export default (state = initialState) : ItemType => state;

export { initialState };
