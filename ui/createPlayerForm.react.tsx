import React, { useRef } from 'react';
import { connect } from 'react-redux';

import * as playerActions from '../actions/player.js';
import { Dispatch } from 'redux';
import { v4 as uuidV4 } from 'uuid';

const CreatePlayerForm = ({ onSubmit }: ReturnType<typeof mapDispatchToProps>) => {
	const creationName = useRef<HTMLInputElement>(null);
	const submitButton = useRef<HTMLButtonElement>(null);

	return (
		<form
			onSubmit={onSubmit}
		>
			<label htmlFor={'playerCreationName'}>Name: </label>
			<input
				id={'playerCreationName'}
				ref={creationName}
				type="text"
				name="playerLabel"
			/>
			<button
				ref={submitButton}
				type="submit"
			>
				{'Create player'}
			</button>
			<button
				type="button"
				onClick={() => {
					if (creationName.current && submitButton.current) {
						creationName.current.value = uuidV4();
						submitButton.current.click();
					}
				}}
			>
				{'Create with random name'}
			</button>
		</form>
	);
};

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
