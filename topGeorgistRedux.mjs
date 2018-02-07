import React from 'react';
import PropTypes from 'prop-types';
import CreatePlayerForm from './ui/createPlayerForm.react';

const TopGeorgist = () => (
	<div>
		<p>{'Foobar'}</p>
		<button
			onClick={() => { console.log('arr!'); }}
			type={'button'}
		>
			{'Hey!'}
		</button>
		<CreatePlayerForm />
	</div>
);

export default TopGeorgist;
