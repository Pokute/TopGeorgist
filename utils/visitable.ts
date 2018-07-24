import { TgoType } from "../reducers/tgo";

export const checkOnVisitableLocation = (actorTgo: TgoType , visitableTgo: TgoType) => {
	if (!actorTgo.position || !visitableTgo.position ||
		(actorTgo.position.x !== visitableTgo.position.x) || (actorTgo.position.y !== visitableTgo.position.y))
		return false;

	return true;
};
