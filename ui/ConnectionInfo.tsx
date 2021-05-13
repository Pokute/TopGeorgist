import React from "react";
import { connect } from "react-redux";

import Category from './Category.js';
import { RootStateType } from '../reducers.js';

const ConnectionInfo = ({ serverConnection: connection }: ReturnType<typeof mapStoreToProps>) => (
	<Category
		title={'Connection'}
	>
		<div>
			Websocket:
			{connection.websocket
				? 'defined'
				: 'undefined'
			}
		</div>
	</Category>
);

const mapStoreToProps = (store: RootStateType) => ({
	serverConnection: store.serverConnection,
});

export default connect(mapStoreToProps)(ConnectionInfo);
