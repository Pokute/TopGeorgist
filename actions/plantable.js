const plant = (actorTgoId, plantableTypeId) => ({
	type: 'PLANT',
	actorTgoId,
	plantableTypeId,
});

const harvest = (actorTgoId, targetTgoId) => ({
	type: 'HARVEST',
	actorTgoId,
	targetTgoId,
});

export { plant, harvest };
