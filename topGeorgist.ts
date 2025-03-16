// Client code.
import { store } from './storeClient.ts';
import createItemTypes from './data/types.ts';
import * as viewActions from './actions/view.ts';

const init = () => {
	createItemTypes(store.dispatch);

	store.dispatch(viewActions.render());
};

export default init;
