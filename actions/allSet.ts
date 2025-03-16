import { createAction } from 'typesafe-actions';

import { type RootStateType } from '../reducers/index.ts';

export const set = createAction('ALL_SET',
	(AllState: RootStateType) => (AllState)
)();
