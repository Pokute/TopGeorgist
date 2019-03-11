// import { createAction } from 'typesafe-actions';
// // import { ClientId, ClientType } from '../reducers/client';

// export const add = createAction('MAP_REDUCER_ADD', function<T>(resolve) {
// 	return (client: T) => resolve({
// 		client,
// 	});
// });

// export const remove = createAction('MAP_REDUCER_REMOVE', function<T>(resolve) {
// 	return (id: keyof T) => resolve({
// 		clientId,
// 	});
// });

export interface MapReducerTarget {
	mrType: '',
};

export const add = <T extends MapReducerTarget>(item: T) => ({
	type: 'MAP_REDUCER_ADD',
	mrType: item.mrType,
	item: item,
})

export default {};
