import React from 'react';
import { connect } from 'react-redux';
import { RootStateType } from '../../reducers/index.js';
import MapPosition from '../MapPosition.js';

const VisitableRentOffice = (props: ReturnType<typeof mapStoreToProps>) => (
	<ul>
		<li>{'Rent office info:'}</li>
		<li>{`Total rented land: ${props.claims.length}`}</li>
		{props.citizen === undefined
			? <li>{'You have no claims since you are not a citizen'}</li>
			: (<li>
				<ul>
					<li>
						{`Total rent debt: ${props.citizenClaims.reduce((total, c) => total + c.rentDebt, 0)}`}
					</li>
					<li>{'Your claims:'}</li>
					{props.citizenClaims.map(c => (
						<li key={`${c.position.x},${c.position.y}`}>
							{`Claim - `}
							<MapPosition {...c.position} />
							{`Outstanding rent: ${c.rentDebt}`}
						</li>
					))}
				</ul>
			</li>)
		}
	</ul>
);

const mapStoreToProps = (state: RootStateType) => ({
	claims: state.government.claims,
	citizen: state.defaults.playerTgoId ? state.government.citizens[state.defaults.playerTgoId] : undefined,
	citizenClaims: state.government.claims.filter(c => c.tgoId === state.defaults.playerTgoId),
});

export default connect(mapStoreToProps)(VisitableRentOffice);
