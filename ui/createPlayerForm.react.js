import React from 'react';
import { connect } from 'react-redux';

import * as playerActions from '../actions/player';
import * as netActions from '../actions/net';

const CreatePlayerForm = props => (
	<form
		onSubmit={props.onSubmit}
	>
		<input
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

const mapDispatchToProps = dispatch => ({
	onSubmit: (event) => {
		const data = new FormData(event.target);
		dispatch(netActions.send(playerActions.playerRequest(data.get('playerLabel'))));
		event.preventDefault();
	},
});

export default connect(undefined, mapDispatchToProps)(CreatePlayerForm);
