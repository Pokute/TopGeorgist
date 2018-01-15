import store from './../store.js';

const transaction = (a, b) => {
	return {
		type: 'TRANSACTION',
		a,
		b,
	};
};

export default transaction;
