import { Work } from '../reducers/work';

export const moveWork: Work = {
	type: 'move',
	inputs: [
		{
			typeId: 'calories',
			count: 20,
		},
		{
			typeId: 'tick',
			count: 3,
		}
	],
	outputs: [
		{
			typeId: 'position',
			count: 1,
		}
	],
};
