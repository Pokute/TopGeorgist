import React from 'react';
import { InventoryItem, ComponentInventory, Inventory } from '../components/inventory';
import { useSelector, useDispatch } from 'react-redux';
import { RootStateType } from '../reducers';
import { Work } from '../reducers/work';

const InventoryItem = ({
	ii,
	possibleWorks
}: {
	ii: InventoryItem,
	possibleWorks: Array<Work>
}) => {
	const dispatch = useDispatch();
	const iiInventory = useSelector<RootStateType, Inventory>(state => (
		ii.tgoId
			? state.tgos[ii.tgoId]?.inventory
			: state.itemTypes[ii.typeId]?.inventory
		) ?? []);

	if (!iiInventory) {
		return null;
	}

	const validWorks = possibleWorks
		.filter(work => work.targetItemChanges.length > 0)
		.filter(work => work.targetItemChanges.every(wtic => iiInventory.some(iii => (iii.typeId === wtic.typeId) && (iii.count >= wtic.count))));

	return (<>
		{validWorks.map(validWork => (
			<button
				key={validWork.type}
				// onClick={props.onComponentActionClick(ca, i.typeId)}
				onClick={() => dispatch({ type: 'FOO' })}
			>
				{validWork.type}
			</button>
		))}
	</>);
}

export default InventoryItem;
