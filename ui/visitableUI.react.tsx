import React from 'react';

import VisitableGovernmentBuilding from './visitable/governmentBuilding.js';
import VisitableRentOffice from './visitable/rentOffice.js';
import ActionUI from './action.js';
import { hasComponentStatsBoard, hasComponentRentOffice, hasComponentGovernmentBuilding, ComponentVisitable } from '../data/components_new.js';
import { ComponentLabel } from '../components/label.js';
import { ComponentPosition } from '../components/position.js';
import StatsBoard from './visitable/StatsBoard.js';
import { hasComponentInventory } from '../concerns/inventory.js';
import InventoryReact from './inventory.react.js';

export interface Type {
	readonly visitable: ComponentLabel & ComponentVisitable,
	readonly visitor: ComponentPosition,
};

export default ({ visitable, visitor }: Type) => {
	return (
		<div>
			<p>{visitable.visitable.label}</p>
			{(visitable.visitable.actions ?? [])
				.map(va => (
					<ActionUI
						key={va.label}
						action={va}
						additionalSentData={{
							tgoId: visitor!.tgoId,
							visitableTgoId: visitable.tgoId,
						}}
					/>
				))
			}
			{hasComponentInventory(visitable)
				? <InventoryReact ownerTgo={visitable} />
				: null
			}
			{hasComponentStatsBoard(visitable)
				? <StatsBoard />
				: null
			}
			{hasComponentGovernmentBuilding(visitable)
				? <VisitableGovernmentBuilding />
				: null
			}
			{hasComponentRentOffice(visitable)
				? <VisitableRentOffice />
				: null
			}
		</div>
	);
};
