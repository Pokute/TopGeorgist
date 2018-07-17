import { createAction } from 'typesafe-actions';

import { RootStateType } from '../reducers/index';

export const set = createAction('ALL_SET', (resolve) => {
	return (AllState: RootStateType) => resolve(AllState);
});
