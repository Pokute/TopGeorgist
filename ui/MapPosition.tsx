import * as React from 'react';
import { FC } from 'react';
import { MapPosition as MapPositionData } from '../concerns/map';

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
