import store from './store';

const initVisiting = (viewId) => {
	store.subscribe(() => {
		document.getElementById('visitableTitle').textContent = '';
		document.getElementById('visitableBody').innerHTML = '';

		const state = store.getState();
		const view = state.views.find(v => v.viewId === viewId);
		if (!view) return false;
		const visitor = state.tgos.find(tgo => tgo.tgoId === view.followTgoId);
		if (!visitor) return false;
		const visitableTgos = state.tgos.filter(tgo => {
			if (!tgo.visitable) return false;
			if (!tgo.position) return false;
			if ((tgo.position.x !== visitor.position.x) ||
				(tgo.position.y !== visitor.position.y)) {
				return false;
			}
			return true;
		});
		if (visitableTgos.length > 0) {
			const visitableTgo = visitableTgos[0];
			const visitable = state.tgos.find(tgo => tgo.tgoId === visitableTgo.tgoId);
			if (!visitable) return;

			document.getElementById('visitableTitle').textContent = visitable.name;
			document.getElementById('visitable').visitableTogId = visitable.togId;
			const tb = document.getElementById('visitableBody');
			tb.innerHTML = '';
			visitable.visitable.actions.forEach(a => {
				const row = document.createElement('tr');
				const col = document.createElement('td');
				row.appendChild(col);
				const b = document.createElement('button');
				b.textContent = a.label;
				b.onclick = () => a.onClick(visitable.tgoId, visitor.tgoId);
				col.appendChild(b);
				tb.appendChild(row);
			});
		}
	});
};

export { initVisiting };
