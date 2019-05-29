import { createAction } from 'typesafe-actions';
import { WorkInstance } from '../reducers/workInstance';
import { Work } from '../reducers/work';
import { TgoId } from '../reducers/tgo';

export const createFromWork = createAction('WORK_INSTANCE_CREATE_FROM_WORK', resolve => {
	return ({ work }: { work: Work }) => resolve({
		work,
	});
});

export const createWorkInstance = createAction('WORK_INSTANCE_CREATE', resolve => {
	return ({ goalTgoId, work, targetTgoId }: { goalTgoId: TgoId, work: Work, targetTgoId?: TgoId }) => resolve({
			goalTgoId,
			work,
			targetTgoId,
	});
});
