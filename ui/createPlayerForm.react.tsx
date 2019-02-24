import React from 'react';
import { connect } from 'react-redux';

import * as playerActions from '../actions/player';
import { Dispatch } from 'redux';

const CreatePlayerForm = ({ onSubmit }: ReturnType<typeof mapDispatchToProps>) => (
	<form
		onSubmit={onSubmit}
	>
		<label htmlFor={'playerCreationName'}>Name: </label>
		<input
			id={'playerCreationName'}
			type="text"
			name="playerLabel"
		/>
		<button
			type="submit"
		>
			{'Create player'}
		</button>
	</form>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
		event.stopPropagation();
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const playerLabel = data.get('playerLabel');
		if (typeof playerLabel === 'string') {
			dispatch(playerActions.clientPlayerCreate({ label: playerLabel }));
		}
	},
});

export default connect(undefined, mapDispatchToProps)(CreatePlayerForm);
