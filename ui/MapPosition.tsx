import React, { type FC } from 'react';

import { type MapPosition as MapPositionData } from '../concerns/map.ts';

// Can be used with <MapPosition {...o.position} />

interface MapPositionComponentParams extends MapPositionData {
	readonly title?: string,
};

const MapPosition: FC<MapPositionComponentParams> = ({ x, y }: MapPositionData) => {
	return (
		<button
		>
			{`${x}, ${y}`}
		</button>
	)
};

export default MapPosition;
