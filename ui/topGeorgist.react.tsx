import * as React from 'react';
import { connect } from 'react-redux';

import AccountInfo from './account/AccountInfo.tsx';
import ConnectionInfo from './ConnectionInfo.tsx';
import PlayerContainer from './playerContainer.react.tsx';
import View from './view.react.tsx';
import { type RootStateType } from '../reducers/index.ts';
import About from './About.tsx';

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
		<About />
	</div>
);

const mapStoreToProps = (store: RootStateType) => ({
	views: store.views,
	map: store.map,
	defaultPlayerTgo: store.defaults.playerTgoId && store.tgos[store.defaults.playerTgoId],
	currentTick: store.ticker.currentTick,
});

export default connect(mapStoreToProps)(TopGeorgist);
