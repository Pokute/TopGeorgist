import { TgoType } from '../reducers/tgo.js';
import { ComponentPosition } from '../components/position.js';

export const checkOnVisitableLocation = (actorTgo: ComponentPosition , visitableTgo: ComponentPosition) => {
	if (!actorTgo.position || !visitableTgo.position ||
		(actorTgo.position.x !== visitableTgo.position.x) || (actorTgo.position.y !== visitableTgo.position.y))
		return false;

	return true;
};
