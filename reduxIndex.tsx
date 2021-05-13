import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store.js';
import TopGeorgist from './ui/topGeorgist.react.js';
import init from './topGeorgist.js';
import * as viewsActions from './actions/views.js';
import * as defaultsActions from './actions/defaults.js';
import { TgoId } from './reducers/tgo.js';
import { ViewId } from './reducers/view.js';

const Providers: React.SFC = () => {
	const [ initialized, setInitialized ] = useState(false);
	useEffect(() => {
		init();

		const mainViewAction = store.dispatch(viewsActions.create('main' as ViewId, 'jesh' as TgoId));
		store.dispatch(defaultsActions.setViewId(mainViewAction.payload.view.viewId));

		setInitialized(true);
	}, [])

	if (!initialized)
		return (null);

	return (
		<Provider store={store}>
			<TopGeorgist />
		</Provider>
	);
};

render(
	<Providers />,
	document.getElementById('root'),
);
