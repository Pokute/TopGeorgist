import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as viewUtils from '../utils/view';
import * as netActions from '../actions/net';
import * as viewActions from '../actions/view';

const drawTile = (ctx, pos, tile, tileSize) => {
	ctx.fillStyle = tile ? tile.fillStyle : 'grey';
	// ctx.fillStyle = `#${(Math.random()*0xFFFFFF<<0).toString(16)}`;
	ctx.fillRect(
		pos.x - tileSize / 2, pos.y - tileSize / 2,
		tileSize,
		tileSize,
	);
};

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

const renderCanvasMap = ({
	minTile,
	maxTile,
	map,
	tileSet,
	canvas,
}) => {
	if (!canvas) return;
	if (!tileSet) return;

	const ctx = canvas.getContext('2d');
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
}) => {
	if (!canvas) return;
	// console.log(minTile, maxTile);

	const ctx = canvas.getContext('2d');

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
}) => {
	if (!canvas) return;
	// console.log(minTile, maxTile);

	const ctx = canvas.getContext('2d');
	renderCanvasMap({ minTile, maxTile, map, tileSet, canvas });
	renderCanvasTgos({ minTile, maxTile, tgos, canvas, tileSize: map.tileSize });
};

class GameRenderer extends React.Component {
	render = () => {
		renderCanvas({ ...this.props, canvas: this.canvas });

		return (
			<canvas
				ref={(c) => { this.canvas = c; }}
				id={`view-canvas-${this.props.view.viewId}`}
				width={1000}
				height={600}
				onClick={this.props.onClick}
			/>
		);
	};
};

GameRenderer.propTypes = {
	view: PropTypes.object,
	// from Store
	map: PropTypes.object,
	tgos: PropTypes.object,
	tileSet: PropTypes.object,
	minTile: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired,
	}).isRequired,
	maxTile: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired,
	}).isRequired,
};

const mapStoreToProps = store => ({
	map: store.map,
	tgos: store.tgos,
	tileSet: store.tileSets[store.map.tileSetId],
});

const mapDispatchToProps = (dispatch, { view: v, map, minTile }) => ({
	onClick: (event) => {
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
	onClickMove: (event) => {
		console.log('We clicked!');
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
		const playerMoveAction = {
			type: 'PLAYER_SET_MOVE_TARGET',
			tgoId: v.followTgoId,
			moveTarget: mappedCoords,
		};
		dispatch(playerMoveAction);
		dispatch(netActions.send(playerMoveAction));
		console.log('canvas clicked.', mappedCoords);
		// event.preventDefault();
	},
});

export default connect(mapStoreToProps, mapDispatchToProps)(GameRenderer);
