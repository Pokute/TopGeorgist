import { createAction } from 'typesafe-actions';
import { AnyAction } from 'redux';

export const send = createAction('NET_SEND',
	(sendAction: AnyAction) => ({
		sendAction,
	})
)();

export const receiveMessage = createAction('NET_MESSAGE',
	(messageData: any) => ({
		messageData,
	})
)();
