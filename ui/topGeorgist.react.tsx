import * as React from 'react';
import { connect } from 'react-redux';
import PlayerContainer from './playerContainer.react';
import View from './view.react';
import Inventory from './inventory.react';
import topGeorgist, { RootStateType } from '../reducers';

const TopGeorgist = (props: ReturnType<typeof mapStoreToProps>) => (
	<div>
		{Object.values(props.views).map(v => (
			<View
				view={v}
				map={props.map}
				key={v.viewId}
			/>
		))}
		<PlayerContainer />
		<Inventory ownerTgoId={props.defaultPlayerTgoId} />
	</div>
);

const mapStoreToProps = (store: RootStateType) => ({
	views: store.views,
	map: store.map,
	defaultPlayerTgoId: store.defaults.playerTgoId,
	currentTick: store.ticker.currentTick,
});

export default connect(mapStoreToProps)(TopGeorgist);
