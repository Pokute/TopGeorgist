export const checkOnVisitableLocation = (actorTgo, visitableTgo) => {
	if (!actorTgo.position || !visitableTgo.position || 
		(actorTgo.position.x !== visitableTgo.position.x) || (actorTgo.position.y !== visitableTgo.position.y))
		return false;

	return true;
};
