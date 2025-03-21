import { type AnyAction } from 'redux';

export type TileId = string;

export interface TileType {
	readonly tileId: TileId,
	readonly fillStyle: string,
}

const initialState = {
	tileId: '',
	fillStyle: 'green',
};

export default (state: TileType = initialState, action: AnyAction): TileType => {
	switch (action.type) {
		default:
			return state;
	}
};
