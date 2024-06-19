// Client code.
import { store } from './storeClient.js';
import createItemTypes from './data/types.js';
import * as viewActions from './actions/view.js';

const init = () => {
	createItemTypes(store.dispatch);

	store.dispatch(viewActions.render());
};

export default init;
