import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import GameRenderer from './gameRenderer.react';

const View = props => (
	<div>
		<GameRenderer
			view={props.view}
			map={props.map}
		/>
		<div>
			{props.player ? 
				`Player calories: ${props.player.inventory.find(i => i.typeId === 'calories').count}`
				: undefined
			}
		</div>
	</div>
);

const mapStoreToProps = state => ({
	player: state.tgos.find(tgo => tgo.tgoId === state.defaults.playerTgoId)
});

View.propTypes = {
	viewId: PropTypes.any,
	followTogId: PropTypes.string,
	position: PropTypes.object,
	size: PropTypes.object,
};

export default connect(mapStoreToProps)(View);
