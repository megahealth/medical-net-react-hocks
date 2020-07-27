import AV from 'leancloud-storage';
import pako from 'pako';
import axios from 'axios';
import * as TYPES from './Types';
import moment from 'moment';

const Creator = {};
/*
 * @desc 异步action工厂函数，用来生成异步action所需的三个action
 * @params types {array} action的type字符串，按【正在发送，成功，失败】的顺序传入
 * @params fn {function} 逻辑处理函数，触发action、发起http调用等工作，
 *   会被注入三个参数（前三个），分别对应【正在发送，成功，失败】的action生成器
 *   从第四个参数开始则是外部业务传递进来的参数
 */
const asyncActionFactory = (types, fn) => {
  const getting = data => (
    {
      type: TYPES[types[0]],
      payload: data
    }
  );

  const success = data => (
    {
      type: TYPES[types[1]],
      payload: data
    }
  );

  const fail = err => (
    {
      type: TYPES[types[2]],
      payload: err
    }
  );

  return fn.bind(Creator, getting, success, fail);
};


// 开始动画
Creator.startAnimation = () => ({
  type: TYPES.START_ANIMATION
});

// 获取全部报告
Creator.getAllReportsData = asyncActionFactory(
  ['GET_ALL_REPORTS_DATA', 'GET_ALL_REPORTS_DATA_SUCCESS', 'GET_ALL_REPORTS_DATA_FAILED'],
  (getting, success, fail, limit, current, filter) => async (dispatch) => {
    dispatch(getting());

    const Reports = new AV.Query('Reports');

    // 筛选条件
    if (filter && filter.reportType) {
      if (filter.reportType.indexOf('valid') > -1) {
        Reports.greaterThan('AHI', 0);
      } else if (filter.reportType.indexOf('invalid') > -1) {
        Reports.equalTo('AHI', -1);
      }
    }
    if (filter && filter.startDate) {
      Reports.greaterThan('createdAt', filter.startDate);
    }
    if (filter && filter.endDate) {
      Reports.lessThan('createdAt', filter.endDate);
    }

    const user = AV.User.current();
    const idBaseOrg = user.attributes.idBaseOrg;

    if (limit) Reports.limit(limit);
    if (current) Reports.skip(limit * (current - 1));
    if (idBaseOrg) Reports.equalTo('idBaseOrg', idBaseOrg);
    Reports.descending('createdAt');
    Reports.select(['objectId', 'tempSleepId', 'createdAt', 'isSync', 'AHI', 'patientInfo', 'extraCheckTimeMinute']);
    const total = await Reports.count();
    Reports.find().then((result) => {
      const arr = result.map((item, index) => {
        return {
          'id': item.id,
          'key': index,
          '序号': index + 1,
          '姓名': item.get('patientInfo') && item.get('patientInfo')[0],
          '日期': moment(item.createdAt).format('YYYY-MM-DD'),
          'AHI': item.get('AHI').toFixed(1),
          '总记录时间': `${(item.get('extraCheckTimeMinute') / 60).toFixed(1)}h`,
        }
      });
      console.log(arr);
      dispatch(success({ reports: arr, total, current }));
    }, (err) => {
      dispatch(fail({ errorcode: err }));
    });
  }
);
// 获取所有报告的日期范围
Creator.getDateRange = asyncActionFactory(
  ['GET_DATE_RANGE', 'GET_DATE_RANGE_SUCCESS', 'GET_DATE_RANGE_FAILED'],
  (getting, success, fail) => dispatch => {
    const Reports = new AV.Query('Reports');
    Reports.ascending('createdAt');
    Reports.select(['objectId', 'createdAt']);
    Reports.find().then(result => {
      const startDate = result[0].createdAt;
      const endDate = result[result.length - 1].createdAt;
      dispatch(success({
        startDate: new Date(startDate.toLocaleDateString()),
        endDate: new Date(new Date(endDate.toLocaleDateString()).getTime() + 86400000 - 1)
      }));
    }, (err) => {
      dispatch(fail({ errorcode: err }));
    });
  }
);
// 首页过滤器
Creator.setFilter = filter => ({
  type: TYPES.SET_FILTER,
  payload: filter
});

// 适用云端报告
function decodeRingData(id, ringData, tempSleepId, fileid) {
  return new Promise((resolve, reject) => {
    let data = {};
    if(tempSleepId && fileid) {
      const ringDataUrl = 'https://raw.megahealth.cn/webApi/ringData?fileId=' + fileid + '&tempSleepId=' + tempSleepId;
      axios.get(ringDataUrl).then(res => {
        if(res.data.code===1){
          resolve(res.data.data)
        }else{
          reject();
        }
      }, err => {
        reject(err);
      })
    } else if (ringData) {
      const buf = window.atob(ringData);
      const a = pako.inflate(buf, { to: 'string' });
      if (a.length > 0) {
        data = JSON.parse(a);
      }
      resolve(data);
    } else {
      const url = `https://shcparse.leanapp.cn/parse?proj=shc&objId=${id}`;
      axios.get(url).then((res) => {
        resolve(res.result);
      }, (err) => {
        reject(err);
      });
    }
  });
}

Creator.getReportData = asyncActionFactory(
  ['GET_REPORT_DATA', 'GET_REPORT_DATA_SUCCESS', 'GET_REPORT_DATA_FAILED'],
  (getting, success, fail, id) => async (dispatch) => {
    dispatch(getting());

    const Reports = new AV.Query('Reports');
    const result = await Reports.get(id)

    let data = result.attributes;
    const { ringData, tempSleepId, idRingReportFile } = data;
    const fileid = idRingReportFile && idRingReportFile.id;

    const SPOVER = ( ringData || fileid ) ? 'NEW' : 'NONE';
    data.SPOVER = SPOVER;
    data.patientInfo = data.patientInfo || [];
    delete data.ringData;
    delete data.ringOriginalData;

    const waveUrl = 'https://raw.megahealth.cn/webApi/breathWave?id=' + id;
    let waveRes;
    try {
      waveRes = await axios.get(waveUrl);
    } catch (err) {
      dispatch(fail({ errorcode: err }));
      return;
    }
    const waveData = waveRes && waveRes.data;
    decodeRingData(id, ringData, tempSleepId, fileid).then((alreadyDecodedData) => {
      dispatch(success({ data, alreadyDecodedData, waveData }));
    }, (err) => {
      dispatch(fail({ errorcode: err }));
    });
  }
);

export default Creator;
