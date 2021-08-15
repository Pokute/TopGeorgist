import React from 'react';
import { useSelector } from 'react-redux';

import { RootStateType } from '../../reducers/index.js';
import Category from '../Category.js';
import LoggedIn from './LoggedIn.react.js';
import LoggedOut from './LoggedOut.react.js';

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
