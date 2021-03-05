import { combineReducers } from 'redux';

import * as TYPES from '../actions/Types';
import DefaultState from './DefaultState';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
// locale
const locale = (state = DefaultState.locale, action) => {
  switch (action.type) {
    case TYPES.SET_LOCALE:
      return action.payload==='en' ? enUS : zhCN;
    default:
      return state;
  }
};

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

// 头部数据 
const header = ( state = DefaultState.header, action ) => {
  switch (action.type) {
    case TYPES.SET_HEADER:
      return {
        ...state,
        title: action.payload.title,
      };
    default:
      return state;
  }
}

// 报告列表数据
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
          current: action.payload.current,
          pageSize: action.payload.limit>action.payload.total?action.payload.total:action.payload.limit,
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
        waveData: action.payload.waveData,
        edition: action.payload.data.customInfo || (action.payload.data.idPatient ? action.payload.data.idPatient.attributes : action.payload.data.patientInfo),
        adviceData: action.payload.adviceData || {},
        reportNum: action.payload.reportNum,
        id: action.payload.id,
      };
    case TYPES.GET_REPORT_DATA_FAILED:
      return {
        ...state,
        loading: false,
        error: true
      };
    case TYPES.CHANGE_EDITE_STATUS:
      return {
        ...state,
        isEditting: !state.isEditting
      }
    case TYPES.HANDLE_INPUT_CHANGE:
      let data = action.data;
      return {
        ...state,
        edition: data.edition ? { ...state.edition, ...data.edition } : { ...state.edition },
        adviceData: data.adviceData ? { ...state.adviceData, ...data.adviceData } : { ...state.adviceData }
      };
    case TYPES.CANCEL_UPDATE:
      return {
        ...state,
        edition: state.data.idPatient ? state.data.idPatient.attributes : state.data.patientInfo
      }
    case TYPES.CHANGE_REPORT_NUM:
      return ({
        ...state,
        data: {
          ...state.data,
          idModifiedReport: action.payload.idModifiedReport,
        },
        reportNum: action.payload.reportNum,
      })
    case TYPES.UPDATE_REPORT_STATE_MODIFIED:
      return {
        ...state,
        data:{
          ...state.data,
          idModifiedReport: action.payload.idModifiedReport,
        },
      }
    default:
      return state;
  }
};

// 设备列表数据
const allDevice = (state = DefaultState.allDevice, action) => {
  switch (action.type) {
    case TYPES.GET_ALL_DEVICE_DATA:
      return {
        ...state,
        loading: true
      };
    case TYPES.GET_ALL_DEVICE_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        error: false,
        deviceList: action.payload.deviceList,
        pagination: action.payload.pagination.pageSize > action.payload.pagination.total
          ?{...action.payload.pagination,pageSize:action.payload.pagination.total}
          :action.payload.pagination
      };
    case TYPES.GET_ALL_DEVICE_DATA_FAILED:
      return {
        ...state,
        loading: false,
        error: true
      };
    default:
      return state
  }
}

// 设备详情数据
const deviceDetail = (state = DefaultState.deviceDetail, action) => {
  switch (action.type) {
    case TYPES.GET_DEVICE_DETAIL_DATA:
      return ({
        ...state
      })
    case TYPES.GET_DEVICE_DETAIL_SUCCESS:
      return ({
        ...state,
        roleType: action.payload.roleType,
        deviceId: action.payload.deviceId,
        device: action.payload.device,
      })
    case TYPES.GET_RING_ARR:
      return ({
        ...state
      })
    case TYPES.GET_RING_ARR_SUCCESS:
      return ({
        ...state,
        ringArr:action.payload.ringArr,
      })
    case TYPES.GET_RING_ARR_FAILED:
      return ({
        ...state,
        ringArr:[],
      })
    case TYPES.GET_DEVICE_DETAIL_FAILED:
      return ({
        ...state
      })
    case TYPES.CHANGE_DEVICE_LED:
      return ({
        ...state
      })
    case TYPES.CHANGE_DEVICE_LED_SUCCESS:
      return ({
        ...state,
        device: {
          ...state.device,
          ledOnTime: action.payload.ledOnTime,
        }
      })
    case TYPES.CHANGE_DEVICE_LED_FAILED:
      return ({
        ...state
      })
    case TYPES.CHANGE_DEVICE_PERIOD_AND_MODE:
      return ({
        ...state,
        device: {
          ...state.device,
          modeType: action.payload.modeType,
          period: action.payload.period
        }
      })
    default:
      return state;
  }
}

// 账号管理
const account = (state = DefaultState.account, action) => {
  switch (action.type) {
    case TYPES.CHANGE_ACCOUNT_MODAL_STATUS:
      return ({
        ...state,
        visible: action.payload.visible,
      })
    case TYPES.GET_ACCOUNT:
      return ({
        ...state,
        tableLoading:true
      })
    case TYPES.GET_ACCOUNT_SUCCESS:
      return ({
        ...state,
        tableLoading: false,
        pagination: action.payload.pagination,
        list: action.payload.list,
        searchName: action.payload.searchName,
      })
    case TYPES.GET_ACCOUNT_FAILED:
      return ({
        ...state,
        tableLoading: false,
      })
    case TYPES.ADD_ACCOUNT:
      return ({
        ...state
      })
    case TYPES.ADD_ACCOUNT_SUCCESS:
      return ({
        ...state,
        visible:action.payload.visible,
      })
    case TYPES.ADD_ACCOUNT_FAILED:
      return ({
        ...state
      })
    default:
      return state;
  }
}

const Reducers = combineReducers({
  locale,
  home,
  header,
  allReports,
  report,
  allDevice,
  deviceDetail,
  account,
});

export default Reducers;
