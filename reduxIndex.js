import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import TopGeorgist from './ui/topGeorgist.react';
import init from './topGeorgist';
import * as viewsActions from './actions/views';
import * as defaultsActions from './actions/defaults';

init();

const mainView = store.dispatch(viewsActions.create('main', 'jesh'));
store.dispatch(defaultsActions.setViewId(mainView.viewId));

render(
	<Provider store={store}>
		<TopGeorgist />
	</Provider>,
	document.getElementById('root'),
);
