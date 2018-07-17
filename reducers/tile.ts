import { Color } from "csstype";
import { AnyAction } from "redux";

export type TileId = string;

export interface TileType {
	tileId: TileId,
	fillStyle: Color,
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
