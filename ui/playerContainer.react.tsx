import React from 'react';
import { useSelector } from 'react-redux';

import CurrentPlayerInfo from './currentPlayerInfo.react.js';
import CreatePlayerForm from './createPlayerForm.react.js';
import { TgoId } from '../reducers/tgo.js';
import { RootStateType } from '../reducers/index.js';
import Category from './Category.js';

const PlayerContainer = () => {
	const defaultPlayerTgoId = useSelector<RootStateType, TgoId | undefined>(s => s.defaults.playerTgoId);
	return (
		<Category
			title={'Player'}
		>
			{defaultPlayerTgoId
				? <CurrentPlayerInfo />
				: <CreatePlayerForm />
			}
		</Category>
	);
};

export default PlayerContainer;
