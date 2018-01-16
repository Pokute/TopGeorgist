import store from './../store.js';

const transaction = (...participants) => {
	return {
		type: 'TRANSACTION',
		participants,
	};
};

export default transaction;
