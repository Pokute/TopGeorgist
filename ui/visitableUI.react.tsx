import React from 'react';

import VisitableGovernmentBuilding from './visitable/governmentBuilding.tsx';
import VisitableRentOffice from './visitable/rentOffice.tsx';
import ActionUI from './action.tsx';
import { hasComponentStatsBoard, hasComponentRentOffice, hasComponentGovernmentBuilding, type ComponentVisitable } from '../data/components_new.ts';
import { type ComponentLabel } from '../components/label.ts';
import { type ComponentPosition } from '../components/position.ts';
import StatsBoard from './visitable/StatsBoard.tsx';
import { hasComponentInventory } from '../concerns/inventory.ts';
import InventoryReact from './inventory.react.tsx';

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
