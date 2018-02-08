import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const GameRenderer = props => (
	<canvas
		id={`view-canvas-${props.view.viewId}`}
		width={1000}
		height={600}
	>
	</canvas>
);

GameRenderer.propTypes = {
	view: PropTypes.object,
}

const mapStoreToProps = (store, ownProps) => ({
	map: store.map,
	tgos: store.tgos,
	tileSet: store.tileSets.find(ts => ts.tileSetId === store.map.tileSetId),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	onClick: (event) => {
		const data = new FormData(event.target);
		dispatch(netActions.send(playerActions.playerRequest(data.get('playerLabel'))));
		event.preventDefault();
	},
});

export default connect(mapStoreToProps, mapDispatchToProps)(GameRenderer);
