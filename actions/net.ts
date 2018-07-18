import { createAction } from 'typesafe-actions';
import { AnyAction } from 'redux';

export const send = createAction('NET_SEND', resolve => {
	return (sendAction: AnyAction) => resolve({
		sendAction,
	});
});
