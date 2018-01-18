import store from './store';

const initInventory = (parent, ownerTgoId) => {
	const createInventoryRow = (invItemType) => {
		const row = document.createElement('tr');
		row.className = `inventory_${invItemType.typeId}`;
		const label = document.createElement('th');
		label.textContent = invItemType.label;
		row.appendChild(label);
		const count = document.createElement('td');
		count.className = 'count';
		count.textContent = 0;
		row.appendChild(count);
		if (invItemType.actions) {
			const actionButtons = invItemType.actions.map(iia => {
				const b = document.createElement('button');
				b.textContent = iia.label;
				b.onclick = () => iia.onClick(ownerTgoId);
				return b;
			});
			if (actionButtons.length > 0) {
				const actions = document.createElement('td');
				actionButtons.forEach(b => actions.appendChild(b));
				row.appendChild(actions);
			}
		}
		return row;
	};

	const updateInventoryRow = (row, invItem) => {
		const countElement = row.getElementsByClassName('count')[0];
		if (!countElement) return;
		countElement.textContent = invItem.count;
	};

	store.subscribe(() => {
		const s = store.getState();
		const owner = s.tgos.find(tgo => tgo.tgoId === ownerTgoId);
		if (!owner || !owner.inventory) return;
		owner.inventory.forEach(ii => {
			let row = parent.getElementsByClassName(`inventory_${ii.typeId}`)[0];
			if (!row) row = parent.appendChild(createInventoryRow(s.itemTypes.find(it => it.typeId === ii.typeId)));
			updateInventoryRow(row, ii);
		});
	});
}

export { initInventory };
