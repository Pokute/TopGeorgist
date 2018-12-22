import { createAction } from 'typesafe-actions';

import { AccountId } from '../reducers/account';
import { TgoId } from '../reducers/tgo';

export const setPlayerTgoId = createAction('ACCOUNT_SET_PLAYER_TGO_ID', resolve => {
	return ({ accountId, playerTgoId }: { accountId: AccountId, playerTgoId: TgoId }) => resolve({
		accountId,
		playerTgoId,
	});
});
