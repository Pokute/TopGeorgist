import React from 'react';
import { connect } from 'react-redux';

const VisitableRentOffice = props => (
	<ul>
		<li>{'Rent office info:'}</li>
		<li>{`Total rented land: ${props.claims.legth}`}</li>
		{props.citizen === undefined
			? <li>{'You have no claims since you are not a citizen'}</li>
			: (<li>
				<ul>
					<li>{'Your claims:'}</li>
					<li>
						{`Total rent debt: ${props.citizenClaims.reduce((total, c) => total + c.rentDebt, 0)}`}
					</li>
					{props.citizenClaims.map(c => (
						<li key={`${c.position.x},${c.position.y}`}>
							{`Claim - Position: ${c.position.x},${c.position.y} Outstanding rent: ${c.rentDebt}`}
						</li>
					))}
				</ul>
			</li>)
		}
	</ul>
);

const mapStoreToProps = state => ({
	claims: state.government.claims,
	citizen: state.government.citizens.find(c => c.tgoId === state.defaults.playerTgoId),
	citizenClaims: state.government.claims.filter(c => c.tgoId === state.defaults.playerTgoId),
});

export default connect(mapStoreToProps)(VisitableRentOffice);
