import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as viewActions from '../actions/view';
import { ViewType } from '../reducers/view';
import { RootStateType } from '../reducers';
import { TgosState } from '../reducers/tgos';
import { TileType } from '../reducers/tile';
import { TileSetType } from '../reducers/tileSet';
import { MapType } from '../reducers/map';

const drawTile = (ctx: CanvasRenderingContext2D , pos: { x: number, y: number }, tile: TileType, tileSize: number) => {
	ctx.fillStyle = tile ? tile.fillStyle : 'grey';
	// ctx.fillStyle = `#${(Math.random()*0xFFFFFF<<0).toString(16)}`;
	ctx.fillRect(
		pos.x - tileSize / 2, pos.y - tileSize / 2,
		tileSize,
		tileSize,
	);
};

const drawCross = (ctx: CanvasRenderingContext2D, pos: { x: number, y: number }, size = {x: 10, y: 10}, strokeStyle = 'black') => {
	ctx.beginPath();
	ctx.strokeStyle = strokeStyle;
	ctx.moveTo(pos.x - size.x/2, pos.y - size.y/2);
	ctx.lineTo(pos.x + size.x/2, pos.y + size.y/2);
	ctx.stroke();
	ctx.moveTo(pos.x - size.x/2, pos.y + size.y/2);
	ctx.lineTo(pos.x + size.x/2, pos.y - size.y/2);
	ctx.stroke();
};

const renderCanvasMap = ({
	minTile,
	maxTile,
	map,
	tileSet,
	canvas,
}:{
	minTile: { x: number, y: number },
	maxTile: { x: number, y: number },
	map: MapType,
	tileSet: TileSetType,
	canvas: HTMLCanvasElement,
}) => {
	if (!canvas) return;
	if (!tileSet) return;

	const tryCanvas = canvas.getContext('2d');
	if (!tryCanvas) return;
	const ctx = tryCanvas as CanvasRenderingContext2D;
	for (let y = Math.floor(minTile.y); y < Math.ceil(maxTile.y); y++)
		for (let x = Math.floor(minTile.x); x < Math.ceil(maxTile.x); x++) {
			const tile = (
					(x >= 0) && (x < map.size.x)
					&& (y >= 0) && (x < map.size.y)
				)
				? tileSet.tiles[map.data[map.size.x * y + x]]
				: tileSet.tiles[0];
			drawTile(
				ctx,
				{
					x: map.tileSize * (x - minTile.x + 0.5),
					y: map.tileSize * (y - minTile.y + 0.5)
				},
				tile,
				map.tileSize,
			);
		}
}

const renderCanvasTgos = ({
	minTile,
	maxTile,
	tgos,
	canvas,
	tileSize,
}:{
	minTile: { x: number, y: number },
	maxTile: { x: number, y: number },
	tgos: TgosState,
	canvas: HTMLCanvasElement,
	tileSize: number,
}) => {
	if (!canvas) return;
	// console.log(minTile, maxTile);

	const tryCanvas = canvas.getContext('2d');
	if (!tryCanvas) return;
	const ctx = tryCanvas as CanvasRenderingContext2D;

	Object.values(tgos).forEach((tgo) => {
		const pos = {
			x: (tgo.position.x - minTile.x + 0.5)*tileSize,
			y: (tgo.position.y - minTile.y + 0.5)*tileSize,
		};
		drawCross(ctx,
			pos,
			undefined, tgo.color);
		if (tgo.label) {
			ctx.fillStyle = 'black';
			ctx.textAlign = 'center';
			ctx.fillText(tgo.label, pos.x, pos.y - 10);
		}
	})
};

const renderCanvas = ({
	minTile,
	maxTile,
	map,
	tgos,
	tileSet,
	canvas,
}:{
	minTile: { x: number, y: number },
	maxTile: { x: number, y: number },
	map: MapType,
	tgos: TgosState,
	tileSet: TileSetType,
	canvas: HTMLCanvasElement,
}) => {
	if (!canvas) return;
	// console.log(minTile, maxTile);

	const ctx = canvas.getContext('2d');
	renderCanvasMap({ minTile, maxTile, map, tileSet, canvas });
	renderCanvasTgos({ minTile, maxTile, tgos, canvas, tileSize: map.tileSize });
};

export interface Type {
	view: ViewType,
	map: MapType,
	minTile: { x: number, y: number },
	maxTile: { x: number, y: number },
}

type Props = Type & ReturnType<typeof mapStoreToProps> & ReturnType<typeof mapDispatchToProps>;

const GameRenderer: React.SFC<Props> = ({
	view,
	map,
	minTile,
	maxTile,
	tgos,
	tileSet,
	onClick,
}) => {
	const canvas = useRef<HTMLCanvasElement>();

	const onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (event.button == 2) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	const onMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (event.button == 2) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	const onContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
		event.preventDefault();
	}

	if (canvas.current) {
		renderCanvas({
			minTile: minTile,
			maxTile: maxTile,
			map: map,
			tgos: tgos,
			tileSet: tileSet,
			canvas: canvas.current
		});
	}

	return (
		<canvas
			ref={canvas}
			id={`view-canvas-${view.viewId}`}
			width={1000}
			height={600}
			onClick={onClick}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onContextMenu={onContextMenu}
		/>
	);
};

const mapStoreToProps = (store: RootStateType) => ({
	tgos: store.tgos,
	tileSet: store.tileSets[store.map.tileSetId],
});

const mapDispatchToProps = (dispatch: Dispatch, { view: v, map, minTile }: Type) => ({
	onClick: (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!v) return;
		if (!map) return;

		const canvasCoords = {
			x: event.nativeEvent.offsetX,
			y: event.nativeEvent.offsetY,
		};
		const mappedCoords = {
			x: Math.trunc((canvasCoords.x / map.tileSize) + minTile.x),
			y: Math.trunc((canvasCoords.y / map.tileSize) + minTile.y),
		};
		dispatch(viewActions.rawClick(v.viewId, mappedCoords));
	},
});

export default connect<
	ReturnType<typeof mapStoreToProps>,
	ReturnType<typeof mapDispatchToProps>,
	Type,
	RootStateType
>(mapStoreToProps, mapDispatchToProps)(GameRenderer);
