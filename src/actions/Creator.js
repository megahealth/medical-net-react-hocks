import AV from 'leancloud-storage';
import pako from 'pako';
import axios from 'axios';
import * as TYPES from './Types';
import moment from 'moment';
import { Toast } from 'antd-mobile';

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
    if (filter && filter.deviceId) {
      const device = AV.Object.createWithoutData('Device', filter.deviceId);
      Reports.equalTo('idDevice', device)
    }

    const user = AV.User.current();
    const idBaseOrg = user.attributes.idBaseOrg;
    const roleType = user.attributes.roleType;
    if (limit) Reports.limit(limit);
    if (current) Reports.skip(limit * (current - 1));
    if (roleType == 5) {
      const queryRoleType = new AV.Query('BaseOrganizations');
      queryRoleType.equalTo('type', 'ZGSMZX');
      queryRoleType.limit(1000);
      Reports.matchesQuery('idBaseOrg', queryRoleType)
    } else {
      if (idBaseOrg) Reports.equalTo('idBaseOrg', idBaseOrg);
    }
    if (idBaseOrg.id === '5b14eb612f301e0038e08fba') {
      let idGroup = AV.Object.createWithoutData('Group', '5f605940e86fc14735ac3c5f');
      Reports.equalTo('idGroup', idGroup);
    }
    Reports.descending('createdAt');
    Reports.select(['objectId', 'tempSleepId', 'createdAt', 'isSync', 'AHI', 'idPatient', 'idReport', 'idDevice', 'patientInfo', 'extraCheckTimeMinute', 'idGroup', 'startSleepTime', 'startStatusTimeMinute', 'endStatusTimeMinute']);
    Reports.include(['idPatient', 'idDevice']);
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
        let sn = item.get('idDevice') && (item.get('idDevice').get('deviceSN') || '--');
        let idDevice = item.get('idDevice') && (item.get('idDevice').id || '--');
        let idReport = item.get('idReport') || '';
        const { startSleepTime, startStatusTimeMinute, endStatusTimeMinute, } = item.attributes;
        const start = startSleepTime;
        const sleepStageStart = start + (startStatusTimeMinute === -1 ? 0 : startStatusTimeMinute) * 60 * 1000;
        const sleepStageEnd = start + (endStatusTimeMinute === -1 ? 0 : endStatusTimeMinute) * 60 * 1000;
        const totalMilliseconds = moment.duration(sleepStageEnd - sleepStageStart);
        return {
          'id': item.id,
          'key': index,
          'index': idReport,
          'sn': sn,
          'idDevice': idDevice,
          'name': (arrname || idname) || '未登记',
          'date': moment(item.createdAt).format('YYYY-MM-DD'),
          'AHI': ahiDegree(item.get('AHI').toFixed(1)),
          'time': `${totalMilliseconds.hours()}时${totalMilliseconds.minutes()}分`,
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
    Reports.include('idModifiedReport')
    const result = await Reports.get(id)
    // console.log(result);
    let data = result.attributes;
    const reportNum = data.idModifiedReport ? data.idModifiedReport.get('reportNumber') : '';
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
      const adviceData = DataToEditData(data, alreadyDecodedData)
      if (!alreadyDecodedData) {
        alreadyDecodedData = {
          AHI: 0,
          BECCnt: 0,
          BECnt: 0,
          BEMCnt: 0,
          BEMaxlen: 0,
          BEMaxlentime: 0,
          BEMeanlen: 0,
          BEOHCnt: 0,
          BETotalTime: 0,
          BETotalrate: 0,
          BreathEventVect: [],
          Wakerate: 0,
          Waketime: 0,
          DeepSleeprate: 0,
          DeepSleeptime: 0,
          LightSleeprate: 0,
          LightSleeptime: 0,
          REMrate: 0,
          REMtime: 0,
          SAO2EventVect: [],
          Spo2Arr: [],
          Spo2Avg: 0,
          Spo2Min: 0,
          diffThdLge3Cnts: 0,
          diffThdLge3Pr: 0,
          duration: 0,
          startpos: 0,
          endpos: 0,
          handOffArr: 0,
          handOffArrlen: 0,
          handonTotalTime: 0,
          maxSpo2DownTime: 0,
          prArr: [],
          prAvg: 0,
          prMax: 0,
          prMin: 0,
          spo2Less60Time: 0,
          spo2Less60TimePercent: 0,
          spo2Less70Time: 0,
          spo2Less70TimePercent: 0,
          spo2Less80Time: 0,
          spo2Less80TimePercent: 0,
          spo2Less85Time: 0,
          spo2Less85TimePercent: 0,
          spo2Less90Time: 0,
          spo2Less90TimePercent: 0,
          spo2Less95Time: 0,
          spo2Less95TimePercent: 0,
          timeStart: 0,
        }
      }
      dispatch(success({ data, alreadyDecodedData, waveData, adviceData, reportNum, id }));
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

// 获取设备列表
Creator.getAllDevice = asyncActionFactory(
  ['GET_ALL_DEVICE_DATA', 'GET_ALL_DEVICE_DATA_SUCCESS', 'GET_ALL_DEVICE_DATA_FAILED'],
  (getting, success, fail, pagination) => async (dispatch) => {
    dispatch(getting());
    const { pageSize, current } = pagination;
    const user = AV.User.current();
    const roleType = user.attributes.roleType;
    var DeviceQuery = new AV.Query('Device');
    DeviceQuery.select(["active", "belongTo", "boundDevices", "deviceSN", "idBaseOrg", "idBoundDevice", "idDevice", "idPatient", "isAutoUpdateRing", "isAutoUpdate", "ledOnTime", "localIP", "modeType", "monitorStatus", "order", "period", "rawDataUpload", "reportTitle", "ringRealtime", "ringStatus", "romVersion", "sleepStatus", "status", "versionNO", "workStatus", "wifiName"]);
    DeviceQuery.include("idPatient", "idBoundDevice", "idBaseOrg");

    let count, deviceLists, deviceList;
    if (roleType == 5) {
      var innerQuery1 = new AV.Query("BaseOrganizations");
      innerQuery1.equalTo("type", 'ZGSMZX');
      innerQuery1.limit(1000);
      DeviceQuery.matchesQuery('idBaseOrg', innerQuery1);
    } else if (roleType == 6) {
      let { idBaseOrg } = user.attributes;
      DeviceQuery.equalTo('idBaseOrg', idBaseOrg);
    }
    else {
      dispatch(fail({ errorcode: '登录信息错误！' }));
    }
    try {
      count = await DeviceQuery.count();
      pagination.total = count
    } catch (error) {
      dispatch(fail({ errorcode: error }));
    }

    DeviceQuery.addDescending('createdAt');
    DeviceQuery.limit(pageSize);
    DeviceQuery.skip((current - 1) * 10);
    try {
      deviceLists = await DeviceQuery.find();
    } catch (error) {
      dispatch(fail({ errorcode: error }));
    }
    deviceList = []
    try {
      deviceLists.forEach(item => {
        const device = item.attributes;
        deviceList.push({
          key: item.id,
          idBaseOrg: device.idBaseOrg.id,
          deviceSN: device.deviceSN,
          versionNO: device.versionNO,
          status: deviceStatus(device.workStatus, device.monitorStatus),
          period: device.period,
        })
      })
    } catch (error) {
      dispatch(fail({ errorcode: error }));
    }

    try {
      const devices = await handleUser(deviceList);
      dispatch(success({ pagination: pagination, deviceList: devices }));
    } catch (error) {
      dispatch(fail({ errorcode: error }));
    }
  })

// 获取设备详情
Creator.getDeviceDetail = asyncActionFactory(
  ['GET_DEVICE_DETAIL_DATA', 'GET_DEVICE_DETAIL_SUCCESS', 'GET_DEVICE_DETAIL_FAILED'],
  (getting, success, fail, id) => async (dispatch) => {
    dispatch(getting())
    let count;
    let res = [];
    const user = AV.User.current();
    const roleType = user.attributes.roleType
    let { idBaseOrg } = user.attributes;
    const queryDevice = new AV.Query('Device');
    queryDevice.include('idPatient')
    queryDevice.select(['deviceSN', 'period', 'modeType', 'versionNO', 'workStatus', 'monitorStatus', 'wifiName', 'idPatient', 'ledOnTime', 'localIP']);
    if (roleType == 5 || roleType == 6) {
      try {
        res = await queryDevice.get(id);
      } catch (error) {
        dispatch(fail({ errorcode: error }));
      }
    } else {
      dispatch(fail({ errorcode: '登录信息错误！' }));
    }
    const device = res[0] ? res[0].attributes : res.attributes;
    const deviceId = res[0] ? res[0].id : res.id;
    if (device) {
      // 获取戒指列表
      Creator.getRingArr(device)
      // 查询报告数量
      const queryReportsCount = new AV.Query('Reports');
      const idDevice = new AV.Object.createWithoutData('Device', deviceId);
      queryReportsCount.equalTo('idDevice', idDevice);
      try {
        count = await queryReportsCount.count();
        device.count = count;
      } catch (error) {
        console.log('error1', error);
        dispatch(fail({ errorcode: error }));
      }
      dispatch(success({
        deviceId: deviceId,
        roleType: roleType,
        device: device,
      }))
    }
  }
)
// 获取戒指列表
Creator.getRingArr = async (device) => {
  let ringArr;
  let res = [];
  try {
    var url = "http://" + device.localIP + ":8080/v2/getBoundDevices?type=MegaRing";
    res = await axios.get(url);
    ringArr = res.data.result.boundDevices;
  } catch (error) {
    console.log('error1', error);
  }
  return ({
    type: TYPES.GET_RING_ARR,
    payload: { ringArr: ringArr && ringArr.length > 0 ? _parseRingInfo(ringArr) : [] }
  })
}
// 设备详情页呼吸灯开关
Creator.changeLED = asyncActionFactory(
  ['CHANGE_DEVICE_LED', 'CHANGE_DEVICE_LED_SUCCESS', 'CHANGE_DEVICE_LED_FAILED'],
  (getting, success, fail, led, id) => async (dispatch) => {
    dispatch(getting());
    const device = AV.Object.createWithoutData('Device', id)
    device.set('ledOnTime', led)
    device.save().then(res => {
      dispatch(success({ ledOnTime: led }))
    }).catch(error => {
      dispatch(fail({ errorcode: error }));
    })
  }
)

// 设备详情页监控时段和模式的修改
Creator.changeMonitorAndMode = (params) => {
  const { modeType, timeEnd, timeStart } = params;
  const period = timeStart + '-' + timeEnd;
  return ({
    type: TYPES.CHANGE_DEVICE_PERIOD_AND_MODE,
    payload: { modeType, period }
  })
}

// 病例号修改
Creator.changeReportNum = (params) => {
  const { idModifiedReport, reportNum } = params;
  return ({
    type: TYPES.CHANGE_REPORT_NUM,
    payload: { idModifiedReport, reportNum }
  })
}
//设备 
function deviceStatus(workStatus, monitorStatus) {
  switch (workStatus) {
    case "1":
      switch (monitorStatus) {
        case "0":
          return {
            str: "Online",
            color: "rgb(227,207,87)",
            wifiConect: true
          };
        case "1":
          return {
            str: "Monitoring",
            color: "green",
            wifiConect: true
          };
      }
    default:
      return {
        str: "Not online",
        color: "black",
        wifiConect: false
      };
  }
}

// 处理报告数据成养老版editData格式
function DataToEditData(data, alreadyDecodedData) {
  var obj = {}
  if (data.editedData) {
    // 暂不使用编辑数据替代原有数据
    // if (false) {
    const sleepTimeObj = getSleepTime(data)
    obj = {
      ...data.editedData
    }
    if (!obj.totalRecord) {
      obj.totalRecord = sleepTimeObj.totalRecord
    }
  } else {
    if (alreadyDecodedData) {
      obj = {
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
  }
  const sleepTimeObj = getSleepTime(data, alreadyDecodedData)
  obj = { ...obj, ...sleepTimeObj }
  return obj
}

function getSleepPercent(data, alreadyDecodedData) {
  const { sleepData } = data;
  let wakeTime = 0;
  let remSleep = 0;
  let lightSleep = 0;
  let deepSleep = 0;
  let all = 0;
  let wakeTimePer = 0;
  let remSleepPercent = 0;
  let lightSleepPercent = 0;
  let deepSleepPercent = 0;
  if (alreadyDecodedData) {
    const { Waketime, Wakerate, REMtime, REMrate, LightSleeptime, LightSleeprate, DeepSleeptime, DeepSleeprate } = alreadyDecodedData
    wakeTime = Waketime;
    remSleep = REMtime;
    lightSleep = LightSleeptime;
    deepSleep = DeepSleeptime;
    wakeTimePer = Wakerate ? parseFloat(Wakerate).toFixed(1) : 0;
    remSleepPercent = REMrate ? parseFloat(REMrate).toFixed(1) : 0;
    lightSleepPercent = LightSleeprate ? parseFloat(LightSleeprate).toFixed(1) : 0;
    deepSleepPercent = DeepSleeprate ? parseFloat(DeepSleeprate).toFixed(1) : 0;
  } else {
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
    wakeTimePer = parseFloat((wakeTime * 100 / all).toFixed(1)) ? parseFloat((wakeTime * 100 / all).toFixed(1)) : 0;
    deepSleepPercent = (parseFloat((deepSleep * 100 / all).toFixed(1)) ? parseFloat((deepSleep * 100 / all).toFixed(1)) : 0);
    lightSleepPercent = (parseFloat((lightSleep * 100 / all).toFixed(1)) ? parseFloat((lightSleep * 100 / all).toFixed(1)) : 0);
    remSleepPercent = (parseFloat((remSleep * 100 / all).toFixed(1)) ? parseFloat((remSleep * 100 / all).toFixed(1)) : 0);
  }

  const totalSleepMilliseconds = moment.duration((lightSleep + remSleep + deepSleep) * 60 * 1000);
  return {
    wakeTime,
    remSleep,
    lightSleep,
    deepSleep,
    wakeTimePer,
    deepSleepPercent,
    lightSleepPercent,
    remSleepPercent,
    totalSleepTime: `${totalSleepMilliseconds.hours()}时${totalSleepMilliseconds.minutes()}分`,
    totalSleepMilliseconds: (lightSleep + remSleep + deepSleep) * 60 * 1000
  };
}

function getSleepTime(data, alreadyDecodedData) {
  const { startSleepTime, startStatusTimeMinute, endStatusTimeMinute, extraCheckTimeMinute, AHI } = data;
  const start = startSleepTime;
  const sleepStageStart = start;
  // const sleepStageStart = start + (startStatusTimeMinute === -1 ? 0 : startStatusTimeMinute) * 60 * 1000;
  const sleepStageEnd = start + (endStatusTimeMinute === -1 ? 0 : endStatusTimeMinute) * 60 * 1000;
  const end = start + (extraCheckTimeMinute === -1 ? 0 : extraCheckTimeMinute) * 60 * 1000;
  const totalMilliseconds = moment.duration(sleepStageEnd - sleepStageStart);
  const sleepEfficiency = (getSleepPercent(data, alreadyDecodedData).totalSleepMilliseconds * 100 / (sleepStageEnd - sleepStageStart)).toFixed(1);
  return {
    ahi: data.AHI.toFixed(1),
    fallAsleep: moment(start).format('HH:mm'),
    getUp: moment(end).format('HH:mm'),
    secStart: moment(sleepStageStart).format('HH:mm'),
    secEnd: moment(sleepStageEnd).format('HH:mm'),
    totalRecord: `${totalMilliseconds.hours()}时${totalMilliseconds.minutes()}分`,
    sleepEfficiency: sleepEfficiency,
    wakeTime: getSleepPercent(data, alreadyDecodedData).wakeTime,
    remSleep: getSleepPercent(data, alreadyDecodedData).remSleep,
    lightSleep: getSleepPercent(data, alreadyDecodedData).lightSleep,
    deepSleep: getSleepPercent(data, alreadyDecodedData).deepSleep,
    wakeTimePer: getSleepPercent(data, alreadyDecodedData).wakeTimePer,
    totalRecordTime: getSleepPercent(data, alreadyDecodedData).totalSleepTime,
    deepSleepPercent: getSleepPercent(data, alreadyDecodedData).deepSleepPercent,
    lightSleepPercent: getSleepPercent(data, alreadyDecodedData).lightSleepPercent,
    remSleepPercent: getSleepPercent(data, alreadyDecodedData).remSleepPercent,
  };
}

// 设备列表需要所属账号
async function handleUser(datas) {
  // 设备归属账号\根据idBaseOrg查询User表中username
  var _UserQuery1 = new AV.Query('_User');
  var orgPointer1 = AV.Object.createWithoutData('BaseOrganizations', (datas[0] && datas[0].idBaseOrg) || '1');
  _UserQuery1.equalTo('idBaseOrg', orgPointer1);

  var _UserQuery2 = new AV.Query('_User');
  var orgPointer2 = AV.Object.createWithoutData('BaseOrganizations', (datas[1] && datas[1].idBaseOrg) || '1');
  _UserQuery2.equalTo('idBaseOrg', orgPointer2);

  var _UserQuery3 = new AV.Query('_User');
  var orgPointer3 = AV.Object.createWithoutData('BaseOrganizations', (datas[2] && datas[2].idBaseOrg) || '1');
  _UserQuery3.equalTo('idBaseOrg', orgPointer3);

  var _UserQuery4 = new AV.Query('_User');
  var orgPointer4 = AV.Object.createWithoutData('BaseOrganizations', (datas[3] && datas[3].idBaseOrg) || '1');
  _UserQuery4.equalTo('idBaseOrg', orgPointer4);

  var _UserQuery5 = new AV.Query('_User');
  var orgPointer5 = AV.Object.createWithoutData('BaseOrganizations', (datas[4] && datas[4].idBaseOrg) || '1');
  _UserQuery5.equalTo('idBaseOrg', orgPointer5);

  var _UserQuery6 = new AV.Query('_User');
  var orgPointer6 = AV.Object.createWithoutData('BaseOrganizations', datas[5] && datas[5].idBaseOrg || '1');
  _UserQuery6.equalTo('idBaseOrg', orgPointer6);

  var _UserQuery7 = new AV.Query('_User');
  var orgPointer7 = AV.Object.createWithoutData('BaseOrganizations', datas[6] && datas[6].idBaseOrg || '1');
  _UserQuery7.equalTo('idBaseOrg', orgPointer7);

  var _UserQuery8 = new AV.Query('_User');
  var orgPointer8 = AV.Object.createWithoutData('BaseOrganizations', datas[7] && datas[7].idBaseOrg || '1');
  _UserQuery8.equalTo('idBaseOrg', orgPointer8);

  var _UserQuery9 = new AV.Query('_User');
  var orgPointer9 = AV.Object.createWithoutData('BaseOrganizations', datas[8] && datas[8].idBaseOrg || '1');
  _UserQuery9.equalTo('idBaseOrg', orgPointer9);

  var _UserQuery10 = new AV.Query('_User');
  var orgPointer10 = AV.Object.createWithoutData('BaseOrganizations', datas[9] && datas[9].idBaseOrg || '1');
  _UserQuery10.equalTo('idBaseOrg', orgPointer10);

  var _UserQueryAll = AV.Query.or(_UserQuery1, _UserQuery2, _UserQuery3, _UserQuery4, _UserQuery5, _UserQuery6, _UserQuery7, _UserQuery8, _UserQuery9, _UserQuery10);
  _UserQueryAll.include("idBaseOrg");
  let userRes = await _UserQueryAll.find();
  for (var i = 0; i < userRes.length; i++) {
    for (var j = 0; j < datas.length; j++) {
      if (userRes[i].get('idBaseOrg').id == datas[j].idBaseOrg) {
        let userId = userRes[i].id;
        let hotelId = userRes[i].get('idBaseOrg').get('idOrganization');
        let userName = userRes[i].get('username');
        let nickName = userRes[i].get('name');
        datas[j].userId = userId;
        datas[j].hotelId = hotelId;
        datas[j].userName = userName;
        datas[j].nickName = nickName;
      }
    }
  }
  return datas;
}

// 设备型号
function _parseRingInfo(ringArr) {
  return ringArr.map(item => {
    const ringInfo = item;
    var typeOfSN = ringInfo.sn.slice(0, 4);
    var newTypeOfRing = typeOfSN == 'P11B' ? 'Ceramics' : 'Metal';
    item.typeOfSN = newTypeOfRing
    return item
  })
}

// AHI程度
function ahiDegree(ahi) {
  if (ahi == -1 || ahi == 0) {
    return {
      ahi: ahi,
      color: '#ccc',
      degree: '无效',
    }
  }
  if (ahi < 5 && ahi > 0) {
    return {
      ahi: ahi,
      color: 'balck',
      degree: '正常',
    }
  }
  if (ahi >= 5 && ahi < 15) {
    return {
      ahi: ahi,
      color: 'balck',
      degree: '轻度',
    }
  }
  if (ahi >= 15 && ahi < 30) {
    return {
      ahi: ahi,
      color: 'balck',
      degree: '中度',
    }
  }
  if (ahi >= 30) {
    return {
      ahi: ahi,
      color: 'balck',
      degree: '重度',
    }
  }
  return {};
}

export default Creator;
