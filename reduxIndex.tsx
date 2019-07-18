import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import TopGeorgist from './ui/topGeorgist.react';
import init from './topGeorgist';
import * as viewsActions from './actions/views';
import * as defaultsActions from './actions/defaults';
import { TgoId } from './reducers/tgo';
import { ViewId } from './reducers/view';

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
