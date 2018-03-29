import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PlayerContainer from './playerContainer.react';
import View from './view.react';
import Inventory from './inventory.react';

const TopGeorgist = props => (
	<div>
		{Object.values(props.views).map(v => (
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
		<Inventory ownerTgoId={props.defaultPlayerTgoId} />
	</div>
);

const mapStoreToProps = store => ({
	views: store.views,
	map: store.map,
	defaultPlayerTgoId: store.defaults.playerTgoId,
	currentTick: store.ticker.currentTick,
});

export default connect(mapStoreToProps)(TopGeorgist);
