import store from './store';

const createStatsRow = (id, reducer, toString) => {
	const row = document.createElement('tr');
	document.getElementById('statsBody').appendChild(row);;
	const label = document.createElement('th');
	label.textContent = id;
	row.appendChild(label);
	const data = document.createElement('td');
	row.appendChild(data);

	store.subscribe(() => {
		const val = reducer(store.getState());
		data.textContent = typeof(toString) === 'function' ?
			toString(val) :
			val;
	});
}

const updateStats = () => {
	const moveRight = document.createElement('button');
	moveRight.textContent = 'moveRight';
	moveRight.onclick = movePlayerRight;
	document.getElementById('controls').appendChild(moveRight);
}

export { createStatsRow };
