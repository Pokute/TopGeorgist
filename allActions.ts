import { tickerActions } from "./concerns/ticker"
import { ActionType } from "typesafe-actions"
import { serverConnectionActions } from "./actions/serverConnection";
import * as defaultsActions from './actions/defaults';

const allActions = {
	defaults: defaultsActions,
	ticker: tickerActions,
	serverConnection: serverConnectionActions,
}

export type AllActions = ActionType<typeof allActions>;

export default allActions;
