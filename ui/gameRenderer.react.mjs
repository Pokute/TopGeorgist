import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as viewUtils from '../utils/view';

const GameRenderer = props => (
	<canvas
		id={`view-canvas-${props.view.viewId}`}
		width={1000}
		height={600}
		onClick={props.onClick}
	>
	</canvas>
);

GameRenderer.propTypes = {
	view: PropTypes.object,
}

const mapStoreToProps = (store, ownProps) => ({
	// map: store.map,
	tgos: store.tgos,
	tileSet: store.tileSets.find(ts => ts.tileSetId === store.map.tileSetId),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	onClick: (event) => {
		console.log('We clicked!');
		const v = ownProps.view;
		if (!v) return;
		const map = ownProps.map;
		if (!map) return;
		const { minTile, offset } = viewUtils.getMetrics(v.viewId);
		const canvasCoords = {
			x: event.nativeEvent.offsetX,
			y: event.nativeEvent.offsetY,
		};
		const mappedCoords = {
			x: Math.trunc(canvasCoords.x / map.tileSize + offset.x) + minTile.x,
			y: Math.trunc(canvasCoords.y / map.tileSize + offset.y) + minTile.y,
		};
		dispatch({
			type: 'PLAYER_SET_MOVE_TARGET',
			tgoId: v.followTgoId,
			moveTarget: mappedCoords,
		});
		console.log('canvas clicked.', mappedCoords)
		// event.preventDefault();
	},
});

export default connect(mapStoreToProps, mapDispatchToProps)(GameRenderer);
