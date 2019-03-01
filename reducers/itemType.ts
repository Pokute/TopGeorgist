import { ItemTypesState } from "./itemTypes";
import { ComponentList, ComponentArray } from "../components";

// export type TypeId = keyof ItemTypesState;
export type TypeId = string;

export interface InitialItemType {
	readonly label?: string,
	readonly stackable?: boolean,
	readonly positiveOnly?: boolean,
	readonly isInteger?: boolean,
	readonly building?: boolean,
	readonly growsIntoTypeId?: TypeId,
	readonly components?: ComponentArray,
	readonly isStorable?: boolean,
};

export interface ItemType extends Readonly<InitialItemType> {
	readonly typeId: TypeId,
};

const initialState: ItemType = {
	typeId: '',
	stackable: true,
};

// Itemtypes should not be modifiable during runtime.
export default (state = initialState) : ItemType => state;

export { initialState };
