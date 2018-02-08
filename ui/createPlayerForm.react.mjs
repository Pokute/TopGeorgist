import React from 'react';
import { connect } from 'react-redux';

import * as playerActions from '../actions/player';
import * as netActions from '../actions/net';

class CreatePlayerForm extends React.Component {
	render = () => (
		<form
			onSubmit={this.props.onSubmit}
		>
			<input
				type={'text'}
				name={'playerLabel'}
				ref={input => this.nameInput = input}
			/>
			<button
				type={'submit'}
			>
				{'Create player'}
			</button>
		</form>
	);
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	onSubmit: (event) => {
		const data = new FormData(event.target);
		dispatch(netActions.send(playerActions.playerRequest(data.get('playerLabel'))));
		event.preventDefault();
	},
});

export default connect(undefined, mapDispatchToProps)(CreatePlayerForm);
