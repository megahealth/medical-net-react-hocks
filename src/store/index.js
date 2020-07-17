import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import Reducers from '../reducers';

const middlewares = [thunk];

if (process.env.NODE_ENV !== 'production') {
  const logger = createLogger({
    collapsed: (getState, action, logEntry) => !logEntry.error,
  });
  middlewares.push(logger);
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const Store = createStore(Reducers, composeEnhancers(
  applyMiddleware(...middlewares)
));
export default Store;
