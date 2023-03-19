import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as netActions from '../actions/net.js';
import { RootStateType } from '../reducers/index.js';
import Category from './Category.js';
import InventoryTgo from './InventoryTgo.js';
import recipes from '../data/recipes.js';
import { ComponentInventory } from '../concerns/inventory.js';
import InventoryItem from './InventoryItem.react.js';
import { consumerActions, consumerIsTypeConsumable } from '../concerns/consumer.js';
import { ItemTypesState } from '../reducers/itemTypes.js';
import { hasComponentConsumer } from '../concerns/consumer.js';

interface Type {
	readonly ownerTgo: ComponentInventory,
};

export default ({ ownerTgo } : Type) => {
	const dispatch = useDispatch();
	const itemTypes = useSelector<RootStateType, ItemTypesState>(s => s.itemTypes)

	return (<Category
		title={'Inventory'}
	>
		{ownerTgo.inventory.map(i => (
			<div
				key={i.tgoId || i.typeId}
			>
				{(i.typeId === 'tgoId')
					? (<InventoryTgo i={i} />)
					: (<span>{`${i.typeId} : ${i.count}`}</span>)
				}
				<InventoryItem
					ii={i}
					possibleRecipes={Object.values(recipes)}
				/>
				{hasComponentConsumer(ownerTgo)
					&& consumerIsTypeConsumable(ownerTgo, itemTypes[i.typeId])
					&& <button onClick={() => dispatch(netActions.send(consumerActions.consume({
						tgoId: ownerTgo.tgoId!,
						consumedItem: { typeId: i.typeId, count: 1 }
				})))}>
					consume
				</button>}
			</div>
		))}
	</Category>)
};
