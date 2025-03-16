import React from 'react';
import { useSelector } from 'react-redux';

import CurrentPlayerInfo from './currentPlayerInfo.react.tsx';
import CreatePlayerForm from './createPlayerForm.react.tsx';
import { type TgoId } from '../reducers/tgo.ts';
import { type RootStateType } from '../reducers/index.ts';
import Category from './Category.tsx';

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
