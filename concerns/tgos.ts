import { RootStateType } from '../reducers/index.js';
import { TgoId, TgoType } from '../reducers/tgo.js';

export const selectTgo = (state: RootStateType, tgoId: TgoId) =>
	state.tgos[tgoId];

// Using this like allows to use type guarding funcs like hasComponentInventory for arrays of tuples.
// Example: Object.entries(tgos).filter(createTupleFilter(hasComponentInventory))
export const createTupleFilter = <DerivedT extends BaseT, BaseT extends TgoType>(filterFunc: (tgo?: BaseT) => tgo is DerivedT) => (tgoTuple: [tgoId: string, tgoz?: BaseT]) : tgoTuple is [string, (BaseT & Required<DerivedT>)] =>
	filterFunc(tgoTuple[1]);
