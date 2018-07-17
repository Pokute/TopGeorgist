import { Color } from "../node_modules/csstype";
import { AnyAction } from "../node_modules/redux";

export type TileId = string;

interface TileType {
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
