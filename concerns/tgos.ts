import { RootStateType } from '../reducers/index.js';
import { TgoId } from '../reducers/tgo.js';

export const selectTgo = (state: RootStateType, tgoId: TgoId) =>
	state.tgos[tgoId];
