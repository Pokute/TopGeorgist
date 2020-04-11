import { createAction } from "typesafe-actions";
import { engines as randomEngines, integer as randomInteger } from 'random-js';

import { MapSettings, MapType } from "../reducers/map";

export const generate = createAction('MAP_GENERATE',
	(settings: MapSettings) => ({
		settings: {
			seed: randomInteger(-1000000, 1000000)(randomEngines.nativeMath),
			...settings,
		},
	})
)();

export const set = createAction('MAP_SET',
	(mapState: MapType) => (mapState)
)();
