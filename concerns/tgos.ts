import { RootStateType } from '../reducers/index';
import { TgoId } from '../reducers/tgo';

export const selectTgo = (state: RootStateType, tgoId: TgoId) =>
	state.tgos[tgoId];
