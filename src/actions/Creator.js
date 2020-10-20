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
    if (idBaseOrg.id === '5b14eb612f301e0038e08fba') {
      let idGroup = AV.Object.createWithoutData('Group', '5f605940e86fc14735ac3c5f');
      Reports.equalTo('idGroup', idGroup);
    }
    Reports.descending('createdAt');
    Reports.select(['objectId', 'tempSleepId', 'createdAt', 'isSync', 'AHI', 'idPatient', 'patientInfo', 'extraCheckTimeMinute', 'idGroup']);
    Reports.include('idPatient');
    let total, result;
    try {
      total = await Reports.count();
    } catch (error) {
      dispatch(fail({ errorcode: error }));
      return;
    }
    try {
      result = await Reports.find();
      const arr = result.map((item, index) => {
        let arrname = item.get('patientInfo') ? item.get('patientInfo')[0] : '';
        let idname = item.get('idPatient') && (item.get('idPatient').get('name') || '--');
        return {
          'id': item.id,
          'key': index,
          'index': index + 1,
          'name': arrname || idname,
          'date': moment(item.createdAt).format('YYYY-MM-DD'),
          'AHI': item.get('AHI').toFixed(1),
          'time': `${(item.get('extraCheckTimeMinute') / 60).toFixed(1)}h`,
        }
      });
      dispatch(success({ reports: arr, total, current }));
    } catch (error) {
      dispatch(fail({ errorcode: error }));
    }
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
    if (tempSleepId && fileid) {
      const ringDataUrl = 'https://webapi.megahealth.cn/webApi/ringData?fileId=' + fileid + '&tempSleepId=' + tempSleepId;
      axios.get(ringDataUrl).then(res => {
        if (res.data.code === 1) {
          resolve(res.data.data)
        } else {
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
    Reports.include('idPatient')
    Reports.include('customInfo')
    Reports.include('editedData')
    const result = await Reports.get(id)
    // console.log(result);
    let data = result.attributes;
    const { ringData, tempSleepId, idRingReportFile } = data;
    const fileid = idRingReportFile && idRingReportFile.id;

    const SPOVER = (ringData || fileid) ? 'NEW' : 'NONE';
    data.SPOVER = SPOVER;
    // 医疗版用户信息是以数组的形式存储，需转化成对象
    data.patientInfo = data.patientInfo ? {
      name: data.patientInfo[0],
      gender: data.patientInfo[1],
      age: data.patientInfo[2],
      height: data.patientInfo[3],
      weight: data.patientInfo[4]
    } : {};
    // console.log(data.patientInfo);
    delete data.ringData;
    delete data.ringOriginalData;

    const waveUrl = 'https://webapi.megahealth.cn/webApi/breathWave?id=' + id;
    let waveRes;
    try {
      waveRes = await axios.get(waveUrl);
    } catch (err) {
      dispatch(fail({ errorcode: err }));
      return;
    }
    const waveData = waveRes && waveRes.data;
    decodeRingData(id, ringData, tempSleepId, fileid).then((alreadyDecodedData) => {
      // console.log(alreadyDecodedData);

      const adviceData = DataToEditData(data, alreadyDecodedData)
      dispatch(success({ data, alreadyDecodedData, waveData, adviceData }));
    }, (err) => {
      dispatch(fail({ errorcode: err }));
    });
  }
);

// 编辑状态
Creator.changeEditStatus = () => ({
  type: TYPES.CHANGE_EDITE_STATUS,
});

// 提交输入框的值
Creator.handleInputChange = (adviceData, edition) => ({
  type: TYPES.HANDLE_INPUT_CHANGE,
  data: { adviceData, edition }
});

// 取消修改
Creator.cancelUpdate = () => ({
  type: TYPES.CANCEL_UPDATE,
})

// 保存修改
Creator.saveUpdate = asyncActionFactory(
  ['SAVE_UPDATE', 'SAVE_UPDATE_SUCCESS', 'SAVE_UPDATE_FAILED'],
  (getting, success, fail, data, id) => async (dispatch) => {
    dispatch(getting())
    // console.log(data);
    const { adviceData, edition } = data


    const report = AV.Object.createWithoutData('Reports', id);
    if (edition) {
      const { name, age, gender, height, weight } = edition;
      const userInfo = {
        name, age, gender, height, weight
      }
      // console.log(userInfo);
      report.set('customInfo', userInfo);
      report.set('hasEdited', true);
    }
    if (adviceData) {
      // console.log(adviceData);
      report.set('editedData', adviceData);
      report.set('hasEdited', true);
    }
    try {
      await report.save();
      dispatch(success())
      dispatch(Creator.changeEditStatus())
    } catch (error) {
      console.log(error);
      dispatch(fail())
    }


  }
)

// 处理报告数据成养老版editData格式
function DataToEditData(data, alreadyDecodedData) {
  var obj = {}
  if (data.editedData) {
    const sleepTimeObj = getSleepTime(data)
    obj = data.editedData
    if (!obj.totalRecord) {
      obj.totalRecord = sleepTimeObj.totalRecord
    }
  } else {
    if (alreadyDecodedData) {
      obj = {
        ahi: data.AHI.toFixed(1),
        ahiAdvice: null,

        secStart: null,
        fallAsleep: null,
        secEnd: null,
        getUp: null,
        sleepEfficiency: null,
        totalRecordTime: null,
        deepSleepPercent: null,
        lightSleepPercent: null,
        remSleepPercent: null,

        average: alreadyDecodedData.BEMeanlen,
        max: alreadyDecodedData.BEMaxlen,
        maxDuration: moment(alreadyDecodedData.BEMaxlentime).format('HH:mm'),
        totalBreathNum: alreadyDecodedData.BECnt,
        totalDuration: alreadyDecodedData.BETotalTime,
        validInTotal: alreadyDecodedData.BETotalrate,
        eventCnt: alreadyDecodedData.BEOHCnt,
        mixBreathNum: alreadyDecodedData.BECCnt,
        centralBreathNum: alreadyDecodedData.BEMCnt,

        prAvg: alreadyDecodedData.prAvg,
        prMax: alreadyDecodedData.prMax,
        prMin: alreadyDecodedData.prMin,

        spo2Avg: alreadyDecodedData.Spo2Avg,
        spo2Min: alreadyDecodedData.Spo2Min,
        diffThdLge3Cnts: alreadyDecodedData.diffThdLge3Cnts,
        diffThdLge3Pr: alreadyDecodedData.diffThdLge3Pr,

        spo2Less80Time: alreadyDecodedData.spo2Less80Time,
        spo2Less80TimePercent: alreadyDecodedData.spo2Less80TimePercent,
        spo2Less85Time: alreadyDecodedData.spo2Less85Time,
        spo2Less85TimePercent: alreadyDecodedData.spo2Less85TimePercent,
        spo2Less90Time: alreadyDecodedData.spo2Less90Time,
        spo2Less90TimePercent: alreadyDecodedData.spo2Less90TimePercent,
        spo2Less95Time: alreadyDecodedData.spo2Less95Time,
        spo2Less95TimePercent: alreadyDecodedData.spo2Less95TimePercent,
      }
    }
    const sleepTimeObj = getSleepTime(data)
    obj = { ...obj, ...sleepTimeObj }
  }

  return obj
}

function getSleepPercent(data) {
  const { sleepData } = data;
  let wakeTime = 0;
  let remSleep = 0;
  let lightSleep = 0;
  let deepSleep = 0;
  let all = 0;
  if (sleepData.length != 0) {
    for (let i = 0, j = sleepData.length; i < j; i++) {
      all++;
      switch (sleepData[i]) {
        case 0:
          wakeTime++;
          break;
        case 2:
          remSleep++;
          break;
        case 3:
          lightSleep++;
          break;
        case 4:
          deepSleep++;
          break;
        default:
          break;
      }
    }
  }
  const wakeTimePer = parseFloat((wakeTime * 100 / all).toFixed(1)) ? parseFloat((wakeTime * 100 / all).toFixed(1)) : 100;
  const totalSleepMilliseconds = moment.duration((lightSleep + remSleep + deepSleep) * 60 * 1000);

  return {
    totalSleepTime: `${totalSleepMilliseconds.hours()}H${totalSleepMilliseconds.minutes()}m`,
    sleepPercent: 100 - wakeTimePer,
    deepSleepPercent: (parseFloat((deepSleep * 100 / all).toFixed(1)) ? parseFloat((deepSleep * 100 / all).toFixed(1)) : 100),
    lightSleepPercent: (parseFloat((lightSleep * 100 / all).toFixed(1)) ? parseFloat((lightSleep * 100 / all).toFixed(1)) : 100),
    remSleepPercent: (parseFloat((remSleep * 100 / all).toFixed(1)) ? parseFloat((remSleep * 100 / all).toFixed(1)) : 100),

  };
}

function getSleepTime(data) {
  const { startSleepTime, startStatusTimeMinute, endStatusTimeMinute, extraCheckTimeMinute } = data;
  const start = startSleepTime;
  const sleepStageStart = start + (startStatusTimeMinute === -1 ? 0 : startStatusTimeMinute) * 60 * 1000;
  const sleepStageEnd = start + (endStatusTimeMinute === -1 ? 0 : endStatusTimeMinute) * 60 * 1000;
  const end = start + (extraCheckTimeMinute === -1 ? 0 : extraCheckTimeMinute) * 60 * 1000;
  const totalMilliseconds = moment.duration(sleepStageEnd - sleepStageStart);

  return {
    fallAsleep: moment(start).format('HH:mm'),
    getUp: moment(end).format('HH:mm'),
    secStart: moment(sleepStageStart).format('HH:mm'),
    secEnd: moment(sleepStageEnd).format('HH:mm'),
    totalRecord: `${totalMilliseconds.hours()}H${totalMilliseconds.minutes()}m`,
    totalRecordTime: getSleepPercent(data).totalSleepTime,
    sleepEfficiency: getSleepPercent(data).sleepPercent,
    deepSleepPercent: getSleepPercent(data).deepSleepPercent,
    lightSleepPercent: getSleepPercent(data).lightSleepPercent,
    remSleepPercent: getSleepPercent(data).remSleepPercent,
  };
}

export default Creator;
