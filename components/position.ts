import { createAction, ActionType, getType } from 'typesafe-actions';

import { TgoRoot, TgoId, TgoType } from '../reducers/tgo';
import { MapPosition } from '../reducers/map';

export type ComponentPosition = TgoRoot & {
	readonly position: MapPosition,
};

export const hasComponentPosition = <BaseT extends TgoType>(tgo: BaseT) : tgo is (BaseT & Required<ComponentPosition>) =>
tgo && (tgo.position !== undefined) && (tgo.position.x !== undefined) && (tgo.position.y != undefined);

export const setPosition = createAction('TGO_SET_POSITION', (resolve) =>
	(tgoId: TgoId, position: ComponentPosition['position']) => resolve({
		tgoId,
		position,
	})
);

export const positionActions = {
	setPosition,
};

export type PositionActionType = ActionType<typeof positionActions>;

export const initialState:{ position: MapPosition } = {
	position: {
		x: 0,
		y: 0,
	},
};

export const reducer = (state: ComponentPosition, action: PositionActionType) : ComponentPosition => {
	switch (action.type) {
		case getType(setPosition):
			return {
				...state,
				position: action.payload.position
			};
		default:
			return state;
	}
};
