import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CurrentPlayerInfo from './currentPlayerInfo.react';
import CreatePlayerForm from './createPlayerForm.react';

const propTypes = {
	defaultPlayerTgoId: PropTypes.string,
};

const PlayerContainer = (props) => {
	if (props.defaultPlayerTgoId) {
		return <CurrentPlayerInfo />;
	}

	return <CreatePlayerForm />;
};

PlayerContainer.propTypes = propTypes;

const mapStoreToProps = store => ({
	defaultPlayerTgoId: store.defaults.playerTgoId,
});

export default connect(mapStoreToProps)(PlayerContainer);
