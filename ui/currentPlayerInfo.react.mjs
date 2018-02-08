import React from 'react';
import { connect } from 'react-redux';

const CurrentPlayerInfo = props => (
	<div>
		{`Player name: ${props.player.label}`}
	</div>
);

const mapStoreToProps = store => ({
	player: store.tgos.find(tgo => tgo.tgoId === store.defaults.playerTgoId),
});

export default connect(mapStoreToProps)(CurrentPlayerInfo);
