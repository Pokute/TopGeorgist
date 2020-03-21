import { ItemTypesState } from "./itemTypes";
import { ComponentList, ComponentArray } from "../data/components";
import { Inventory } from "../components/inventory";
import { Opaque } from "../typings/global.d";

// export type TypeId = keyof ItemTypesState;
export type TypeId = Opaque<string, 'TypeId'>;

export interface InitialItemType {
	readonly label?: string,
	readonly stackable: boolean,
	readonly positiveOnly: boolean,
	readonly isInteger: boolean,
	readonly building?: boolean,
	readonly growsIntoTypeId?: TypeId,
	readonly components?: ComponentArray,
	readonly isStorable: boolean,
	readonly isTgoId?: boolean,
	readonly redeemable: boolean,
	readonly inventory?: Inventory,
};

export interface ItemType extends Readonly<InitialItemType> {
	readonly typeId: TypeId,
};

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
