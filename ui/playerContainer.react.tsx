import React, { ReactNode } from 'react';
import { connect } from 'react-redux';

import CurrentPlayerInfo from './currentPlayerInfo.react';
import CreatePlayerForm from './createPlayerForm.react';
import { TgoId } from '../reducers/tgo';
import { RootStateType } from '../reducers';

export interface propTypes {
	defaultPlayerTgoId: TgoId,
}

const PlayerContainer = (props: propTypes) => {
	if (props.defaultPlayerTgoId) {
		return <CurrentPlayerInfo />;
	}

	return <CreatePlayerForm />;
};

const mapStoreToProps = (store: RootStateType) => ({
	defaultPlayerTgoId: store.defaults.playerTgoId,
});

export default connect(mapStoreToProps)(PlayerContainer);
