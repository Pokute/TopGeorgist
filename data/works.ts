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

export const consumeWork: Work = {
	type: 'consume',
	inputs: [
		{
			typeId: 'calories',
			count: 100,
		},
		{
			typeId: 'tick',
			count: 2,
		},
	],
	outputs: [
		{
			typeId: 'calories',
			count: 100,
		}
	],
};
