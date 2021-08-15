import React from 'react';

import { AccountType } from '../../concerns/account.js';
import CreateAccount from './CreateAccount.react.js';
import ChangePassword from './ChangePassword.react.js';
import { useSelector } from 'react-redux';
import { RootStateType } from '../../reducers/index.js';

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
