import store from './store';

const initInventory = (ownerTgoId) => {
	const createInventoryRow = (invItem) => {
		const row = document.createElement('tr');
		document.getElementById('statsBody').appendChild(row);;
		const label = document.createElement('th');
		label.textContent = id;
		row.appendChild(label);
		const count = document.createElement('td');
		count.textContent = 0;
		row.appendChild(count);
		if (invItem.actions) {
			const actionButtons = invItem.actions.map(iia => {
				const b = document.createElement('button');
				b.textContent = iia.label;
				b.onclick = iia.onClick;
				return b;
			});
			if (actionButtons.count > 0) {
				const actions = document.createElement('td');
				actionButtons.forEach(b => actions.appendChild(b));
				row.appendChild(actions);
			}
		}
	};

	store.subscribe(() => {
		const s = store.getState();
		const owner = s.tgos.find(tgo => tgoId === ownerTgoId);
		if (!owner) return;
	});
}

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
		if (val) {
			data.textContent = typeof(toString) === 'function' ?
				toString(val) :
				val;
		} 
	});
}

export { createStatsRow };
