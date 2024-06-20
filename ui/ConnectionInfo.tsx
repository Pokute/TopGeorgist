import React from 'react';
import { connect } from 'react-redux';

import Category from './Category.js';
import { RootStateType } from '../reducers/index.js';

const ConnectionInfo = ({ serverConnection: connection }: ReturnType<typeof mapStoreToProps>) => (
	<Category
		title={'Connection'}
	>
		<ul>
			<li>
				Websocket:
				{connection.websocket
					? 'defined'
					: 'undefined'
				}
			</li>
			<li>
				Connection:
				{connection.connected
					? 'connected'
					: 'not connected'
				}
			</li>
			{!connection.connected &&
				<li>
					Current retry delay: {connection.reconnectionDelay}
				</li>
			}
		</ul>
	</Category>
);

const mapStoreToProps = (store: RootStateType) => ({
	serverConnection: store.serverConnection,
});

export default connect(mapStoreToProps)(ConnectionInfo);
