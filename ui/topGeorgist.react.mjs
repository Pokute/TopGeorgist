import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CreatePlayerForm from './createPlayerForm.react';
import PlayerContainer from './playerContainer.react';
import View from './view.react';

const TopGeorgist = props => (
	<div>
		{props.views.map(v => (
			<View
				view={v}
				map={props.map}
				key={v.viewId}
			/>
		))}
		<button
			onClick={() => { console.log('Arr!'); }}
			type={'button'}
		>
			{'Arr!'}
		</button>
		<PlayerContainer />
	</div>
);

const mapStoreToProps = store => ({
	views: store.views,
	map: store.map,
});

export default connect(mapStoreToProps)(TopGeorgist);
