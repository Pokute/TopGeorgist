import { default as test, DeepEqualAssertion, ExecutionContext } from 'ava';
import 'sinon';
import { TypeId } from '../reducers/itemType';

test('Contract - receive same item type as inputted', t => {
	const contract = {
		input: [{
			typeId: 'water' as TypeId,
			count: -10,
		}],
		output: [
			{
				typeId: 'water' as TypeId,
				count: 8,
			},
			{
				typeId: 'steam' as TypeId,
				count: 2,
			},
		],
		type: 'boilerContract',
	};
});
