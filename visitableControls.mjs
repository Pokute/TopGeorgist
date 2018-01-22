import store from './store';

const initVisiting = (parent, viewId) => {
	store.subscribe(() => {
		parent.getElementsByTagName('caption')[0].textContent = '';
		parent.getElementsByTagName('tbody')[0].innerHTML = '';

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
			const visitable = state.tgos.find(tgo => (tgo.tgoId === visitableTgo.tgoId) && (tgo.tgoId !== visitor.tgoId));
			if (!visitable) return;

			parent.getElementsByTagName('caption')[0].textContent = visitable.visitable.label;
			// document.getElementById('visitable').visitableTogId = visitable.togId;
			const tb = parent.getElementsByTagName('tbody')[0];
			tb.innerHTML = '';
			visitable.visitable.actions.forEach(a => {
				const row = document.createElement('tr');
				const col = document.createElement('td');
				row.appendChild(col);
				const b = document.createElement('button');
				b.textContent = a.label;
				b.onclick = () => a.onClick(visitor.tgoId, visitable.tgoId);
				col.appendChild(b);
				tb.appendChild(row);
			});
		}
	});
};

export { initVisiting };
