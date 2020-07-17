import { combineReducers } from 'redux';

import * as TYPES from '../actions/Types';
import DefaultState from './DefaultState';

// 首页数据
const home = (state = DefaultState.home, action) => {
  switch (action.type) {
    case TYPES.START_ANIMATION:
      return {
        ...state,
        animation: !state.animation
      };
    default:
      return state;
  }
};

// 首页数据
const allReports = (state = DefaultState.allReports, action) => {
  switch (action.type) {
    case TYPES.GET_ALL_REPORTS_DATA:
      return {
        ...state,
        loading: true
      };
    case TYPES.GET_ALL_REPORTS_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        reportsData: action.payload.reports,
        pagination: {
          ...state.pagination,
          total: action.payload.total,
          current: action.payload.current
        }
      };
    case TYPES.GET_ALL_REPORTS_DATA_FAILED:
      return {
        ...state,
        loading: false,
        error: true
      };
    case TYPES.SET_FILTER:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload
        }
      };
    case TYPES.GET_DATE_RANGE_SUCCESS:
      return {
        ...state,
        dateRange: {
          startDate: action.payload.startDate,
          endDate: action.payload.endDate
        },
      }
    default:
      return state;
  }
};

// 报告数据
const report = (state = DefaultState.report, action) => {
  switch (action.type) {
    case TYPES.GET_REPORT_DATA:
      return {
        ...state,
        loading: true
      };
    case TYPES.GET_REPORT_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload.data,
        alreadyDecodedData: action.payload.alreadyDecodedData,
      };
    case TYPES.GET_REPORT_DATA_FAILED:
      return {
        ...state,
        loading: false,
        error: true
      };
    default:
      return state;
  }
};

const Reducers = combineReducers({
  home,
  allReports,
  report
});

export default Reducers;
