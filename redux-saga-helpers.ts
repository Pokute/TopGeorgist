import { select as rawSelect, fork as rawFork, take as rawTake, type SelectEffect, type TakeEffect, type ForkEffect } from 'redux-saga/effects';

import type { RootStateType } from './reducers/index.ts';
import type { AllActions } from './allActions.ts';

type TypedGenSelect<TState> = {
	<TSelected>(
		selector?: (state: TState) => TSelected
	): Generator<SelectEffect, TSelected extends unknown ? TState : TSelected, TSelected extends unknown ? TState : TSelected>
};

export const select: TypedGenSelect<RootStateType> = function* (selFun?: any) {
	if (selFun === undefined) {
		return yield rawSelect();
	} else {
		return yield rawSelect(selFun);
	}
};

type TypedGenFork<TState> = {
	<TSelected>(
		selector?: (state: TState) => TSelected
	): Generator<ForkEffect, TSelected extends unknown ? TState : TSelected, TSelected extends unknown ? TState : TSelected>
};
export const fork: TypedGenFork<RootStateType> = function* (toFork: any) {
	return yield rawFork(toFork);
};

type NarrowAction<T, N> = T extends { type: N } ? T : never;

type TypedGenTakeSingle<Actions extends { type: string }> = {
	<T extends Actions['type']>(
		pattern: T
	): Generator<TakeEffect, NarrowAction<Actions, T>, NarrowAction<Actions, T>>
};

export const take: TypedGenTakeSingle<AllActions> = function* (patternOrChannel: AllActions['type']) {
	return yield rawTake(patternOrChannel);
};
