import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import TopGeorgist from './topGeorgistRedux';
import init from './topGeorgist';

init();

render(
	<Provider store={store}>
		<TopGeorgist />
	</Provider>,
	document.getElementById('root')
);
