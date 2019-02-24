import { TgoType } from "../reducers/tgo";
import { ComponentPosition } from "../components_new";

export const checkOnVisitableLocation = (actorTgo: ComponentPosition , visitableTgo: ComponentPosition) => {
	if (!actorTgo.position || !visitableTgo.position ||
		(actorTgo.position.x !== visitableTgo.position.x) || (actorTgo.position.y !== visitableTgo.position.y))
		return false;

	return true;
};
