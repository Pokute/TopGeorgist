import React, { FormEvent } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';

import * as playerActions from '../actions/player';
import * as netActions from '../actions/net';
import { Dispatch } from 'redux';

const CreatePlayerForm = (props: ReturnType<typeof mapDispatchToProps>) => (
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
		event.stopPropagation();
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const playerLabel = data.get('playerLabel');
		if (typeof playerLabel === 'string') {
			dispatch(netActions.send(playerActions.playerRequest({ label: playerLabel })));
		}
	},
});

export default connect(undefined, mapDispatchToProps)(CreatePlayerForm);
