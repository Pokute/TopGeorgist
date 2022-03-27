import { MapPosition, MapType } from '../concerns/map.js';

const getMinMax = (canvasElement?: HTMLCanvasElement, center?: MapPosition, map?: MapType) => {
	// if (!canvasElement) throw new TypeError('Undefined canvasElement');
	// if (!center || !center.x || !center.y) throw new TypeError('Undefined/bad center');
	if (!canvasElement || !map) return {
		minTile: { x: 0, y: 0 } as MapPosition,
		maxTile: { x: 0, y: 0 } as MapPosition,
	};
	if (center?.x === undefined || center?.y === undefined) throw new TypeError('Undefined/bad center');
	const c = canvasElement!;
	const size = {
		x: c.width,
		y: c.height,
	};
	const sizeInTiles = {
		x: size.x / map.tileSize,
		y: size.y / map.tileSize,
	};

	const paddingTile = {
		x: Math.max(sizeInTiles.x - map.size.x, 0),
		y: Math.max(sizeInTiles.y - map.size.y, 0),
	};
	const minTile = {
		x: center.x - ((sizeInTiles.x - paddingTile.x) / 2),
		y: center.y - ((sizeInTiles.y - paddingTile.y) / 2),
	} as MapPosition;
	const maxTile = {
		x: center.x + (sizeInTiles.x - paddingTile.x),
		y: center.y + (sizeInTiles.y - paddingTile.y),
	} as MapPosition;

	return {
		minTile,
		maxTile,
	}
};

export { getMinMax };
