import React from 'react';
import { connect } from 'react-redux';

import CurrentPlayerInfo from './currentPlayerInfo.react';
import CreatePlayerForm from './createPlayerForm.react';

const PlayerContainer = props => {
	if (props.defaultPlayerTgoId) {
		return <CurrentPlayerInfo />;
	} else {
		return <CreatePlayerForm />;
	}
}

const mapStoreToProps = store => ({
	defaultPlayerTgoId: store.defaults.playerTgoId,
});

export default connect(mapStoreToProps)(PlayerContainer);
