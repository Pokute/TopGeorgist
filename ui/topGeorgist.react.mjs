import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CreatePlayerForm from './createPlayerForm.react';
import PlayerContainer from './playerContainer.react';
import View from './view.react';
import Inventory from './inventory.react';
import ProgressBar from './progressBar.mjs';

const TopGeorgist = props => (
	<div>
		{props.views.map(v => (
			<View
				view={v}
				map={props.map}
				key={v.viewId}
			/>
		))}
		<ProgressBar
			progress={1.25}
			segments={[
				{ title: 'Part1', cost: 3, },
				{ title: 'Part2', cost: 2, },
				{ title: 'Part3', cost: 4, },
			]}
		/>
		<button
			onClick={() => { console.log('Arr!'); }}
			type={'button'}
		>
			{'Arr!'}
		</button>
		<PlayerContainer />
		<Inventory ownerTgoId={props.defaultPlayerTgoId} />
	</div>
);

const mapStoreToProps = store => ({
	views: store.views,
	map: store.map,
	defaultPlayerTgoId: store.defaults.playerTgoId,
});

export default connect(mapStoreToProps)(TopGeorgist);
