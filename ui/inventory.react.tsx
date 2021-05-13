import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import components, { ComponentActionable, Action, ComponentWithParams } from '../data/components.js';
import * as netActions from '../actions/net.js';
import { TypeId } from '../reducers/itemType.js';
import { TgoId } from '../reducers/tgo.js';
import { RootStateType } from '../reducers.js';
import Category from './Category.js';
import InventoryTgo from './InventoryTgo.js';
import recipes from '../data/recipes.js';
import { hasComponentInventory } from '../components/inventory.js';
import InventoryItem from './InventoryItem.react.js';

export interface Type {
	// readonly inventory: ReadonlyArray<InventoryItem>,
	// readonly itemTypes: ItemTypesState,
	readonly ownerTgoId?: TgoId,
	// readonly onComponentActionClick(action: Action, typeId: TypeId): () => void,
};

const Inventory = (props: Type & ReturnType<typeof mapStoreToProps> & ReturnType<typeof mapDispatchToProps>) => props.ownerTgoId && props.inventory ?
(
	<Category
		title={'Inventory'}
	>
		{props.inventory.map(i => (
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
				{/* {((props.itemTypes[i.typeId] || {}) // Find the itemType
					.actions || []) // and with it's actions...
					.map(a =>
						<button
							key={a.label}
							onClick={props.onActionClick(a)}
						>
							{a.label}
						</button>
					)
				} */}
				{/* {props.itemTypes[i.typeId] && // Find the itemType
					props.itemTypes[i.typeId]!.components &&
					props.itemTypes[i.typeId]!.components! // and with it's actions...
					.map<ComponentWithParams>(cEntry => Array.isArray(cEntry) ? cEntry : [ cEntry, undefined ])
					.map<[Partial<ComponentActionable>, {}]>(([cId, params]) => ({ ...components[cId], params }))
					.filter<[ComponentActionable, {}]>((arr): arr is [ComponentActionable, {}] => arr[0].actions !== undefined)
					.map<[ComponentActionable['actions'], {}]>(([component, params]) => [component.actions, params])
					.flat()
					.map(action => Object.entries(action))
					.reduce((arr, c) => [...arr, ...c], [])
					.map(([caId, ca]) =>
						<button
							key={ca.label}
							onClick={props.onComponentActionClick(ca, i.typeId)}
						>
							{ca.label}
						</button>
					)
				} */}
			</div>
		))}
	</Category>
)
: null;

const mapStoreToProps = (store: RootStateType, passedProps: Type) => ({
	inventory: passedProps.ownerTgoId
		? store.tgos[passedProps.ownerTgoId].inventory
		: undefined,
	itemTypes: store.itemTypes,
});

const mapDispatchToProps = (dispatch: Dispatch, passedProps: Type) => ({
	// onActionClick: (action: Action) => (() => dispatch(action.onClick(passedProps.ownerTgoId))),
	onComponentActionClick: (action: Action, targetTypeId: TypeId) => (
		() => dispatch(netActions.send({
			type: action.onClick.type,
			payload: {
				...action.onClick,
				tgoId: passedProps.ownerTgoId,
				targetTypeId,
			},
		}))
	),
});

export default connect(mapStoreToProps, mapDispatchToProps)(Inventory);