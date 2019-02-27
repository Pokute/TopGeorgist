import React, { ReactNode } from 'react';
import { connect } from 'react-redux';

import CurrentPlayerInfo from './currentPlayerInfo.react';
import CreatePlayerForm from './createPlayerForm.react';
import { TgoId } from '../reducers/tgo';
import { RootStateType } from '../reducers';
import Category from './Category';

export interface propTypes {
	readonly defaultPlayerTgoId: TgoId,
}

const PlayerContainer = (props: propTypes) => {
	return (
		<Category
			title={'Player'}
		>
			{props.defaultPlayerTgoId
				? <CurrentPlayerInfo />
				: <CreatePlayerForm />
			}
		</Category>
	);
};

const mapStoreToProps = (store: RootStateType) => ({
	defaultPlayerTgoId: store.defaults.playerTgoId,
});

export default connect(mapStoreToProps)(PlayerContainer);
