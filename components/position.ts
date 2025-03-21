import { createAction, type ActionType, getType } from 'typesafe-actions';

import { type TgoRoot, type TgoId, type TgoType } from '../reducers/tgo.ts';
import { type MapPosition } from '../concerns/map.ts';

export type ComponentPosition = TgoRoot & {
	readonly position: MapPosition,
};

export const hasComponentPosition = <BaseT extends TgoType>(tgo?: BaseT) : tgo is (BaseT & Required<ComponentPosition>) =>
(tgo !== undefined) && (tgo.position !== undefined) && (tgo.position.x !== undefined) && (tgo.position.y != undefined);

export const setPosition = createAction('TGO_SET_POSITION',
	(tgoId: TgoId, position: ComponentPosition['position']) => ({
		tgoId,
		position,
	})
)();

export const positionActions = {
	setPosition,
};

export type PositionActionType = ActionType<typeof positionActions>;

export const initialState:{ position: MapPosition } = {
	position: {
		x: 0,
		y: 0,
	} as MapPosition,
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
