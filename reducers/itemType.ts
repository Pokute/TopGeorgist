import { ItemTypesState } from "./itemTypes";

// export type TypeId = keyof ItemTypesState;
export type TypeId = string;

export interface ItemType {
	readonly typeId: TypeId,
	stackable?: boolean,
};

const initialState: ItemType = {
	typeId: '',
	stackable: true,
};

// Itemtypes should not be modifiable during runtime.
export default (state = initialState) : ItemType => state;

export { initialState };
