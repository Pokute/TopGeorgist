const plant = (actorTgoId, plantableTypeId) => {
	return {
		type: 'PLANT',
		actorTgoId,
		plantableTypeId,
	};
};

const harvest = (actorTgoId, targetTgoId) => {
	return {
		type: 'HARVEST',
		actorTgoId,
		targetTgoId,
	};
};

export { plant, harvest };
