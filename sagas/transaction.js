import { put, select, takeEvery } from 'redux-saga/effects';

const transaction = function* (action) {
	const { a, b } = action;
	if (!a && !b) return false;
	if (!a.tgoId && !b.tgoId) return false;
	if (!a.items && !b.items) return false;

	// Items shape: { typeId, count };

	// Check that both parties have required items.
	const aTgo = { ...yield select(state => state.tgos.find(tgo => tgo.tgoId === a.tgoId)), inventory: [] };
	const bTgo = { ...yield select(state => state.tgos.find(tgo => tgo.tgoId === b.tgoId)), inventory: [] };

	let haveItems = true;
	const aMapped = a.items.map(i => ({ ...i, owned: aTgo.inventory.find(ii => ii.typeId === i.typeId) }));
	const bMapped = b.items.map(i => ({ ...i, owned: bTgo.inventory.find(ii => ii.typeId === i.typeId) }));
	const checkItems = (mapped) => mapped.every(function*(i) {
		const itemType = yield select(state => state.itemTypes.find(it => it.typeId === i.typeId));
		if (!itemType) return true; // Unknown item types have lax rules.
		return (
			!itemType.positiveOnly ||
			i.owned.count - i.count > 0
		);
	});
	haveItems = haveItems && checkItems(aMapped);
	haveItems = haveItems && checkItems(bMapped);
	if (!haveItems) return false; // There's not enough items to satisfy transaction.

	const makeInventoryAdd = (ownerTgoId, typeId, count) => ({
		type: 'TGO_INVENTORY_ADD',
		tgoId: ownerTgoId,
		item: {
			typeId: typeId,
			count: count,
		},
	});
	
	const makeAddsForOwner = (ownerTgoId, mapped) =>
		mapped.map(m => makeInventoryAdd(ownerTgoId, m.typeId, m.count));
	
	yield (makeAddsForOwner(a.tgoId, aMapped)).map(action => put(action));
	yield (makeAddsForOwner(b.tgoId, bMapped)).map(action => put(action));
}

const transactionListener = function*() {
	console.log('transaction start');
	yield takeEvery('TRANSACTION', transaction);
	console.log('transaction end');
}

export default transactionListener;
