// Client code.
import { store } from './store';
import createItemTypes from './data/types';
import * as viewActions from './actions/view';

const init = () => {
	createItemTypes(store.dispatch);

	store.dispatch(viewActions.render());
};

export default init;
