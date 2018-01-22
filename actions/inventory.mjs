const add = (ownerTgoId, typeId, count = 1) => ({
	type: 'TGO_INVENTORY_ADD',
	tgoId: ownerTgoId,
	item: {
		typeId: typeId,
		count: count,
	},
});

export { add };
