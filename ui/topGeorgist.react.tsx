import * as React from 'react';
import { connect } from 'react-redux';

import AccountInfo from './account/AccountInfo.js';
import ConnectionInfo from './ConnectionInfo.js';
import PlayerContainer from './playerContainer.react.js';
import View from './view.react.js';
import { RootStateType } from '../reducers/index.js';

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
		<AccountInfo />
		<ConnectionInfo />
	</div>
);

const mapStoreToProps = (store: RootStateType) => ({
	views: store.views,
	map: store.map,
	defaultPlayerTgo: store.defaults.playerTgoId && store.tgos[store.defaults.playerTgoId],
	currentTick: store.ticker.currentTick,
});

export default connect(mapStoreToProps)(TopGeorgist);
