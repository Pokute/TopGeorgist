import store from './store';

const createStatsRow = (id, reducer, toString) => {
	const row = document.createElement('tr');
	const label = document.createElement('th');
	label.textContent = id;
	row.appendChild(label);
	const data = document.createElement('td');
	row.appendChild(data);

	store.subscribe(() => {
		const val = reducer(store.getState());
		if (val) {
			data.textContent = typeof(toString) === 'function' ?
				toString(val) :
				val;
		} 
	});
	
	return row;
}

export { createStatsRow };
