import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import components from '../components';
import * as netActions from '../actions/net';

const Inventory = props => props.inventory ?
(
	<>
		{props.inventory.map(i => (
			<div
				key={i.typeId}
			>
				<span>{`${i.typeId} : ${i.count}`}</span>
				{((props.itemTypes[i.typeId] || {}) // Find the itemType
					.actions || []) // and with it's actions...
					.map(a =>
						<button
							key={a.label}
							onClick={props.onActionClick(a)}
						>
							{a.label}
						</button>
					)
				}
				{((props.itemTypes[i.typeId] || {}) // Find the itemType
					.components || []) // and with it's actions...
					.map(cEntry => (typeof cEntry === 'string') ? [cEntry] : cEntry)
					.map(([cId, params]) => [components[cId], params])
					.map(([c, params]) => c.actions || []) // Actions for component
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
	</>
)
: null;

const mapStoreToProps = (store, passedProps) => ({
	inventory: passedProps.ownerTgoId
		? store.tgos[passedProps.ownerTgoId].inventory
		: undefined,
	itemTypes: store.itemTypes,
});

const mapDispatchToProps = (dispatch, passedProps) => ({
	onActionClick: action => (() => dispatch(action.onClick(passedProps.ownerTgoId))),
	onComponentActionClick: (action, targetTypeId) => (
		() => dispatch(netActions.send({
			...action.onClick,
			actorTgoId: passedProps.ownerTgoId,
			targetTypeId,
		}))
	),
});

export default connect(mapStoreToProps, mapDispatchToProps)(Inventory);