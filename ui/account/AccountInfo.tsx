import React from 'react';
import { useSelector } from 'react-redux';

import { type RootStateType } from '../../reducers/index.ts';
import Category from '../Category.tsx';
import LoggedIn from './LoggedIn.react.tsx';
import LoggedOut from './LoggedOut.react.tsx';

export default () => {
	const isLoggedIn = useSelector((s: RootStateType) => !!s.accounts[s.defaults.accountId]);

	return (
		<Category
			title={'Account'}
		>
			{isLoggedIn
				? <LoggedIn />
				: <LoggedOut />
			}
		</Category>
	);
};
