import { createAction } from 'typesafe-actions';

import { RootStateType } from '../reducers';

export const set = createAction('ALL_SET', (resolve) => {
	return (AllState: RootStateType) => resolve(AllState);
});
