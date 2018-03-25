import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Inventory = props => props.inventory ?
(
	<div>
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
			</div>
		))}
	</div>
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
});

export default connect(mapStoreToProps, mapDispatchToProps)(Inventory);