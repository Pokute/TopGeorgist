import { ItemTypesState } from "./itemTypes";
import { ComponentList, ComponentArray } from "../components";

// export type TypeId = keyof ItemTypesState;
export type TypeId = string;

export interface InitialItemType {
	label?: string,
	stackable?: boolean,
	positiveOnly?: boolean,
	isInteger?: boolean,
	building?: boolean,
	growsIntoTypeId?: TypeId,
	components?: ComponentArray,
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
