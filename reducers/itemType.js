const initialState = {
	typeId: undefined,
	stackable: true,
}

// Itemtypes should not be modifiable during runtime.
export default (state = initialState, action) => {
};

export { intialState };