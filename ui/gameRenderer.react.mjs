import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as viewUtils from '../utils/view';
import * as netActions from '../actions/net';

const drawTile = (ctx, pos, tile, tileSize) => {
	ctx.fillStyle = tile ? tile.fillStyle : 'grey';
	// ctx.fillStyle = `#${(Math.random()*0xFFFFFF<<0).toString(16)}`;
	ctx.fillRect(pos.x - tileSize / 2, pos.y - tileSize / 2,
		tileSize, tileSize);
}

const drawCross = (ctx, pos, size = {x: 10, y: 10}, strokeStyle = 'black') => {
	ctx.beginPath();
	ctx.strokeStyle = strokeStyle;
	ctx.moveTo(pos.x - size.x/2, pos.y - size.y/2);
	ctx.lineTo(pos.x + size.x/2, pos.y + size.y/2);
	ctx.stroke();
	ctx.moveTo(pos.x - size.x/2, pos.y + size.y/2);
	ctx.lineTo(pos.x + size.x/2, pos.y - size.y/2);
	ctx.stroke();
};

const renderCanvas = ({map, tgos, tileSet, view: v}) => {
	if (!v) return;
	const c = document.getElementById(v.canvasId);
	if (!c) return;

	const { minTile, maxTile, offset } = viewUtils.getMetrics(v, tgos, map);

	const ctx = c.getContext('2d');
	if (!tileSet) return;
	for (let y = minTile.y; y < maxTile.y; y++)
		for (let x = minTile.x; x < maxTile.x; x++) {
			drawTile(ctx, {
				x: map.tileSize * (x - minTile.x + offset.x + 0.5),
				y: map.tileSize * (y - minTile.y + offset.y + 0.5)
			},
			tileSet.tiles[map.data[map.size.x * y + x]],
			map.tileSize);
		}

	Object.values(tgos).forEach(tgo => {
		const pos = {
			x: (tgo.position.x - minTile.x + offset.x + 0.5)*map.tileSize,
			y: (tgo.position.y - minTile.y + offset.y + 0.5)*map.tileSize,
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

const GameRenderer = props => {
	renderCanvas(props);

	return (
		<canvas
			id={`view-canvas-${props.view.viewId}`}
			width={1000}
			height={600}
			onClick={props.onClick}
		>
		</canvas>
	);
};

GameRenderer.propTypes = {
	view: PropTypes.object,
	// from Store
	map: PropTypes.object,
	tgos: PropTypes.object,
	tileSet: PropTypes.object,
}

const mapStoreToProps = (store, ownProps) => ({
	map: store.map,
	tgos: store.tgos,
	tileSet: store.tileSets[store.map.tileSetId],
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	onClick: (event) => {
		console.log('We clicked!');
		const v = ownProps.view;
		if (!v) return;
		const map = ownProps.map;
		if (!map) return;
		const { minTile, offset } = viewUtils.getMetrics(v, [], {});
		const canvasCoords = {
			x: event.nativeEvent.offsetX,
			y: event.nativeEvent.offsetY,
		};
		const mappedCoords = {
			x: Math.trunc(canvasCoords.x / map.tileSize + offset.x) + minTile.x,
			y: Math.trunc(canvasCoords.y / map.tileSize + offset.y) + minTile.y,
		};
		const playerMoveAction = {
			type: 'PLAYER_SET_MOVE_TARGET',
			tgoId: v.followTgoId,
			moveTarget: mappedCoords,
		};
		dispatch(playerMoveAction);
		dispatch(netActions.send(playerMoveAction));
		console.log('canvas clicked.', mappedCoords)
		// event.preventDefault();
	},
});

export default connect(mapStoreToProps, mapDispatchToProps)(GameRenderer);
