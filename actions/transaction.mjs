const transaction = (...participants) => ({
	type: 'TRANSACTION',
	participants,
});

export default transaction;
