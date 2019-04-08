import { createAction } from 'typesafe-actions';
import { WorkInstance } from '../reducers/workInstance';
import { Work } from '../reducers/work';

export const createFromWork = createAction('WORK_INSTANCE_CREATE_FROM_WORK', resolve => {
	return ({ work }: { work: Work }) => resolve({
		work,
	});
});
