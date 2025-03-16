import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './storeClient.ts';
import TopGeorgist from './ui/topGeorgist.react.tsx';
import init from './topGeorgist.ts';
import * as viewsActions from './actions/views.ts';
import * as defaultsActions from './actions/defaults.ts';
import { type TgoId } from './reducers/tgo.ts';
import { type ViewId } from './reducers/view.ts';

const Providers = () => {
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
