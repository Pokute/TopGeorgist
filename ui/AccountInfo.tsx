import React, { useState } from 'react';
import { connect } from 'react-redux';

import { RootStateType } from '../reducers';
import { AccountType } from '../reducers/account';

const AccountInfo = ({ account }: ReturnType<typeof mapStoreToProps>) => {
	const [ accountCreationVisible, setAccountCreationVisible ] = useState(false);

	if (!account) {
		return null;
	}

	return (
		<div>
			<h3>Account information</h3>
			{account.username
				? (<button>Log out</button>)
				: (
					accountCreationVisible
						? <form>
							<label htmlFor={'accountCreationUsername'}>Username: </label>
							<input id={'accountCreationUsername'} /><br />
							<label htmlFor={'accountCreationPassword'}>Password: </label>
							<input id={'accountCreationPassword'} /><br />
							<button>Create account</button>
						</form>
						: <button onClick={() => setAccountCreationVisible(true) }>Create an account</button>
				)
			}
		</div>
	);
};

const mapStoreToProps = (store: RootStateType) => ({
	account: store.defaults.accountId ? store.accounts[store.defaults.accountId] : undefined,
});

export default connect(mapStoreToProps)(AccountInfo);
