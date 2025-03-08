import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as netActions from '../concerns/infra/net.js';
import { RootStateType } from '../reducers/index.js';
import Category from './Category.js';
import InventoryTgo from './InventoryTgo.js';
import recipes from '../data/recipes.js';
import { ComponentInventory, Inventory } from '../concerns/inventory.js';
import InventoryItem from './InventoryItem.react.js';
import { consumerActions, consumerIsTypeConsumable } from '../concerns/consumer.js';
import { ItemTypesState } from '../reducers/itemTypes.js';
import { hasComponentConsumer } from '../concerns/consumer.js';
import { deployableActions, hasComponentDeployable } from '../concerns/deployable.js';
import { TgosState } from '../reducers/tgos.js';

interface Type {
	readonly ownerTgo: ComponentInventory,
};

export const InventoryReactItems = ({ ownerTgo, inventory, extra }: Partial<Type> & { inventory: Inventory, extra?: string }) => {
	const dispatch = useDispatch();
	const itemTypes = useSelector<RootStateType, ItemTypesState>(s => s.itemTypes)
	const tgos = useSelector<RootStateType, TgosState>(s => s.tgos);

	return (<Category
		title={`Inventory ${extra ?? ''}`}
	>
		{inventory.map(i => {
			const iTgo = (i.typeId === 'tgoId') && i.tgoId && tgos[i.tgoId];
			const iType = itemTypes[i.typeId];
			return (
				<div
					key={i.tgoId || i.typeId}
				>
					{iTgo
						? (<InventoryTgo i={i} parentTgoId={ ownerTgo?.tgoId } />)
						: (<span>{`${i.typeId} : ${i.count}`}</span>)
					}
					<InventoryItem
						ii={i}
						possibleRecipes={Object.values(recipes)}
					/>
					{hasComponentConsumer(ownerTgo)
						&& consumerIsTypeConsumable(ownerTgo, iType)
						&& <button onClick={() => dispatch(netActions.send(consumerActions.consume({
							tgoId: ownerTgo.tgoId!,
							consumedItem: { typeId: i.typeId, count: 1 }
					})))}>
						consume
					</button>}
					{(/*(iTgo && hasComponentDeployable(iTgo)) || */iType?.deployable && ownerTgo) &&
						<button onClick={() => dispatch(netActions.send(deployableActions.deployType({
							tgoId: ownerTgo.tgoId,
							deployedTypeId: i.typeId,
					})))}>
						{iType.deployable?.deployVerb ?? 'deploy'}
					</button>}
				</div>
			);
		})}
	</Category>)
};

export default ({ ownerTgo } : Type) => {
	return (<InventoryReactItems
		ownerTgo={ownerTgo}
		inventory={ownerTgo.inventory}
		extra={`tgoId: ${ownerTgo.tgoId}`}
	/>);
};
