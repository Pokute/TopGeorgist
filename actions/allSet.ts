import { createAction } from 'typesafe-actions';

import { RootStateType } from '../reducers.js';

export const set = createAction('ALL_SET',
	(AllState: RootStateType) => (AllState)
)();
