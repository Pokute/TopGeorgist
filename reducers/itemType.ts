export type TypeId = string;

const initialState = {
	typeId: undefined,
	stackable: true,
};

// Itemtypes should not be modifiable during runtime.
export default (state = initialState) => state;

export { initialState };
