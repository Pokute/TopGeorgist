import { createAction } from 'typesafe-actions';
import { nativeMath, integer as randomInteger } from 'random-js';

import { MapSettings, MapType } from '../reducers/map.js';

export const generate = createAction('MAP_GENERATE',
	(settings: MapSettings) => ({
		settings: {
			seed: randomInteger(-1000000, 1000000)(nativeMath),
			...settings,
		},
	})
)();

export const set = createAction('MAP_SET',
	(mapState: MapType) => (mapState)
)();
