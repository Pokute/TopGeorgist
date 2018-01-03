import { createStore } from 'redux'
import topGeorgist from './reducers/index.js'

const store = createStore(topGeorgist);
export default store;
