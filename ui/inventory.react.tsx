import React from 'react';
import { connect } from 'react-redux';
import components, { ComponentActionable, Action } from '../data/components';
import * as netActions from '../actions/net';
import { TypeId } from '../reducers/itemType';
import { TgoId } from '../reducers/tgo';
import { RootStateType } from '../reducers';
import { Dispatch } from 'redux';
import Category from './Category';

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
				<span>{`${i.typeId} : ${i.count}`}</span>
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
				{props.itemTypes[i.typeId] && // Find the itemType
					props.itemTypes[i.typeId]!.components &&
					props.itemTypes[i.typeId]!.components! // and with it's actions...
					.map(cEntry => (typeof cEntry === 'string') ? { cId: cEntry } : { cId: cEntry[0], params: cEntry[1]})
					.map(({cId, params}) => ({ component: components[cId], params }))
					.filter(({ component, params }) => 'actions' in component )
					.map(({component, params}) => (component as ComponentActionable).actions) // Actions for component
					.reduce((arr, c) => [...arr, ...c], [])
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
				}
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
				actorTgoId: passedProps.ownerTgoId,
				targetTypeId,
			},
		}))
	),
});

export default connect(mapStoreToProps, mapDispatchToProps)(Inventory);