import React from 'react';

import type { AccountType } from '../../concerns/account.ts';
import CreateAccount from './CreateAccount.react.tsx';
import ChangePassword from './ChangePassword.react.tsx';
import { useSelector } from 'react-redux';
import { type RootStateType } from '../../reducers/index.ts';

export default () => {
	const account = useSelector((s: RootStateType) => s.accounts[s.defaults.accountId]);
	const clearToken = () => {
		window.localStorage.removeItem('AccountToken');
		window.location.reload();
	};
	return (
		<div>
			<button onClick={clearToken}>Clear token</button>
			{account.username
				? (<div>
					Username: {account.username}<br />
					<ChangePassword />
				</div>
				)
				: (<div>
					Temporary account.<br />
					<CreateAccount />
					</div>
				)
			}
		</div>
	);
};
