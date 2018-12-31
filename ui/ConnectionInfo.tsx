import React from "react";
import { connect } from "react-redux";

import Category from "./Category";
import { RootStateType } from "../reducers";

const ConnectionInfo = ({ connection }: ReturnType<typeof mapStoreToProps>) => (
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
	connection: store.connection,
});

export default connect(mapStoreToProps)(ConnectionInfo);
