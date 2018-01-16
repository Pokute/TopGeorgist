const transaction = (...participants) => {
	return {
		type: 'TRANSACTION',
		participants,
	};
};

export default transaction;
