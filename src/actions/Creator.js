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

Creator.setLocale = (language) => ({
  type: TYPES.SET_LOCALE,
  payload: language
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
      if (idBaseOrg){
        Reports.equalTo('idBaseOrg', idBaseOrg);
        const innerQuery = new AV.Query('Device');
        innerQuery.equalTo('idBaseOrg', idBaseOrg);
        innerQuery.limit(1000)
        Reports.matchesQuery('idDevice',innerQuery)
      } 
    }
    if (idBaseOrg.id === '5b14eb612f301e0038e08fba') {
      let idGroup = AV.Object.createWithoutData('Group', '5f605940e86fc14735ac3c5f');
      Reports.equalTo('idGroup', idGroup);
    }
    
    Reports.descending('createdAt');
    Reports.include(['idPatient', 'idDevice']);
    Reports.select(['objectId', 'tempSleepId', 'createdAt', 'isSync', 'AHI', 'idPatient', 'idReport', 'idDevice','idDevice.deviceSN', 'patientInfo', 'extraCheckTimeMinute', 'idGroup', 'startSleepTime', 'startStatusTimeMinute', 'endStatusTimeMinute', 'editedData']);
    
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
        let ahi = (item.get('editedData')&&parseFloat(item.get('editedData').ahi)) || item.get('AHI').toFixed(1)
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
          'date': moment(item.get('startSleepTime')).format('YYYY-MM-DD'),
          'AHI': ahiDegree(ahi),
          'time': `${totalMilliseconds.hours()}时${totalMilliseconds.minutes()}分`,
        }
      });
      dispatch(success({ reports: arr, total, current, limit }));
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

// 获取报告详情
Creator.getReportData = asyncActionFactory(
  ['GET_REPORT_DATA', 'GET_REPORT_DATA_SUCCESS', 'GET_REPORT_DATA_FAILED'],
  (getting, success, fail, id) => async (dispatch) => {
    dispatch(getting());
    const Reports = new AV.Query('Reports');
    Reports.include('idPatient')
    Reports.include('idBaseOrg')
    Reports.include('idModifiedReport')
    const result = await Reports.get(id)
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
    } : null;
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
Creator.handleInputChange = (adviceData, patientInfo) => ({
  type: TYPES.HANDLE_INPUT_CHANGE,
  data: { adviceData, patientInfo }
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
    console.log(data,id);
    const { adviceData, patientInfo } = data

    const report = AV.Object.createWithoutData('Reports', id);
    if (patientInfo) {
      const { name, age, gender, height, weight } = patientInfo;
      const userInfo = [name, gender, age, height, weight]
      // report.set('customInfo', userInfo);
      report.set('patientInfo', userInfo);
      report.set('hasEdited', true);
    }
    if (adviceData) {
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
      dispatch(Creator.getRingArr(device))
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
Creator.getRingArr = asyncActionFactory(
  ['GET_RING_ARR', 'GET_RING_ARR_SUCCESS', 'GET_RING_ARR_FAILED'],
  (getting, success, fail, device) => async (dispatch) => {
    dispatch(getting());
    try {
      let ringArr;
      let res = [];
      var url = "http://" + device.localIP + ":8080/v2/getBoundDevices?type=MegaRing";
      res = await axios.get(url, {timeout: 3000});
      ringArr = res.data.result.boundDevices;
      dispatch(success({
        ringArr: ringArr && ringArr.length > 0 ? _parseRingInfo(ringArr) : []
      }))
    } catch (error) {
      console.log('getRing',error)
      dispatch(fail({
        errorcode:error
      }))
    }
  }
)
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

// 设置头部
Creator.setHeader = (title) => {
  return({
    type: TYPES.SET_HEADER,
    payload: { title }
  })
}

// 更新裁剪后的数值
Creator.updateModifiedReport = (idModifiedReport) => {
  return ({
    type: TYPES.UPDATE_REPORT_STATE_MODIFIED,
    payload: { idModifiedReport }
  })
}

// 设备详情页监控时段和模式的修改
Creator.changeMonitorAndMode = (params) => {
  const { modeType, period } = params;
  if(modeType == 0 || modeType == 1){
    return ({
      type: TYPES.CHANGE_DEVICE_MODE,
      payload: { modeType }
    })
  }
  if(period){
    return ({
      type: TYPES.CHANGE_DEVICE_PERIOD,
      payload: { period }
    })
  }
}

// 病例号修改
Creator.changeReportNum = (params) => {
  const { idModifiedReport, reportNum } = params;
  return ({
    type: TYPES.CHANGE_REPORT_NUM,
    payload: { idModifiedReport, reportNum }
  })
}

// 账号管理 开启或关闭模态框
Creator.changeAccountModalStatus = (visible) => {
  return ({
    type: TYPES.CHANGE_ACCOUNT_MODAL_STATUS,
    payload: { visible:visible }
  })
}
// 退出登录清除设备的state（ 防止切换账号出现之前的数据 ）
Creator.clearDeviceList = () => {
  return ({
    type: TYPES.CLEAR_DEVICE_STATE
  })
}
// 退出登录清除报告的state（ 防止切换账号出现之前的数据 ）
Creator.clearReportList = () => {
  return ({
    type: TYPES.CLEAR_REPORT_STATE
  })
}
// 账号管理 查询账号列表
Creator.getAccountList = asyncActionFactory(
  ['GET_ACCOUNT', 'GET_ACCOUNT_SUCCESS', 'GET_ACCOUNT_FAILED'],
  (getting, success, fail, pagination, searchName ) => async (dispatch) => {
    dispatch(getting());
    let queryAccount,total;
    const { pageSize, current } = pagination
    const q1 = new AV.Query('_User');
    q1.equalTo('roleType',5);
    const q2 = new AV.Query('_User');
    q2.equalTo('roleType',6);
    if(searchName&&searchName!=undefined){
      const q3 = new AV.Query('_User');
      q3.contains('username', searchName);
      const q = AV.Query.or(q1,q2);
      queryAccount = AV.Query.and(q,q3);
    }else{
      queryAccount = AV.Query.or(q1,q2);
    }
    queryAccount.limit(pageSize);
    queryAccount.skip((current-1)*pageSize);
    try {
      queryAccount.descending('createdAt');
      const res = await queryAccount.find();
      total =  await queryAccount.count();
      dispatch(success({ pagination: { pageSize,current,total }, list:res, searchName: searchName }))
    } catch (error) {
      dispatch(fail({ errorcode: error }));
    }
    
  }
)
// 账号管理 添加账号
Creator.addAccount = asyncActionFactory(
  ['ADD_ACCOUNT', 'ADD_ACCOUNT_SUCCESS', 'ADD_ACCOUNT_FAILED'],
  (getting, success, fail, accountData) => async (dispatch) => {
    dispatch(getting())
    const {name, username, password, roleType, shortName} = accountData;
    const queryAccountCount = new AV.Query('_User');
    queryAccountCount.equalTo('username',username);
    const count = await queryAccountCount.count();
    if(count === 0){
      let hotelSaveResult,baseOrgSaveResult
      // 新建hotel
      try {
        const Hotel = AV.Object.extend('Hotel');
        const hotel1 = new Hotel();
        const cityPY = PinYin(name);
        hotel1.set('roleType',roleType);
        hotel1.set('shortName',shortName);
        hotel1.set('cityPinyin',cityPY);
        hotelSaveResult = await hotel1.save();
      } catch (error) {
        Toast.fail('创建失败，请重试！',2);
        dispatch(fail({
          errorcode:error
        }));
      }

      // 新建BaseOrganizations
      try {
        const BaseOrg = AV.Object.extend('BaseOrganizations');
        const baseOrg = new BaseOrg();
        baseOrg.set('type',shortName);
        baseOrg.set('roleType',roleType);
        baseOrg.set('idOrganization',hotelSaveResult.id);
        baseOrgSaveResult = await baseOrg.save();
      } catch (error) {
        Toast.fail('创建失败，请重试！',2);
        hotelSaveResult.destroy();
        dispatch(fail({
          errorcode:error
        }));
      }

      // 关联baserOrg和hotel
      try {
        hotelSaveResult.set('idBaseOrg',baseOrgSaveResult);
        await hotelSaveResult.save();
      } catch (error) {
        Toast.fail('创建失败，请重试！',2);
        hotelSaveResult.destroy();
        baseOrgSaveResult.destroy();
        dispatch(fail({
          errorcode:error
        }));
      }

      // 创建账户
      try {
        const Account  = AV.Object.extend('_User');
        const account = new Account();
        account.set('name',name);
        account.set('username',username);
        account.set('password',password);
        account.set('roleType',parseInt(roleType));
        account.set('inHotel',shortName);
        account.set('idBaseOrg',baseOrgSaveResult);
        await account.save();
        Toast.success('创建成功',2);
        dispatch(success({
          visible:false
        }))
      } catch (error) {
        Toast.fail('创建失败，请重试！',2);
        hotelSaveResult.destroy();
        baseOrgSaveResult.destroy();
        dispatch(fail({
          errorcode:error
        }));
      }
    }else{
      Toast.info('用户名已存在！', 2);
      dispatch(fail({
        error:'用户名已存在！'
      }))
    }
  }
)

//设备 
function deviceStatus(workStatus, monitorStatus) {
  switch (workStatus) {
    case "1":
      switch (monitorStatus) {
        case "0":
          return {
            str: "已连接",
            color: "#1E58DE",
            wifiConect: true
          };
        case "1":
          return {
            str: "监测中",
            color: "green",
            wifiConect: true
          };
      }
    default:
      return {
        str: "未连接",
        color: '#FC6063',
        wifiConect: false
      };
  }
}

// 处理报告数据成养老版editData格式
function DataToEditData(data, alreadyDecodedData) {
  var obj = {}
  if (data.editedData && JSON.stringify(data.editedData) !="{}") {
    // 暂不使用编辑数据替代原有数据
    // if (false) {
    const sleepTimeObj = getSleepTime(data,alreadyDecodedData)
    obj = {
      ...sleepTimeObj,
      ...data.editedData,
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
        spo2Min: parseFloat(alreadyDecodedData.Spo2Min.toFixed(1)),
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
    const sleepTimeObj = getSleepTime(data, alreadyDecodedData)
    obj = { ...obj, ...sleepTimeObj }
  }
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
    reportTitle: (data.idModifiedReport&&data.idModifiedReport.get('reportTitle')) || '睡眠呼吸报告',
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
    var ringStatus;
    if(ringInfo.active){
      if(ringInfo.connectStatus == 2){
        if(ringInfo.powerStatus == 3) ringStatus = 'background_red';
        if(ringInfo.monitor == 1) {
          ringStatus = 'background_greed'
        }else{
          ringStatus = 'background_blue'
        }
      }else{
        ringStatus = 'background_yellow'
      }
    }else{
      ringStatus = 'background_gry'
    }
    item.typeOfSN = newTypeOfRing
    item.ringStatus = ringStatus
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

  // 中文转拼音首字母
function PinYin(city) {
  var strChineseFirstPY = "YDYQSXMWZSSXJBYMGCCZQPSSQBYCDSCDQLDYLYBSSJGYZZJJFKCCLZDHWDWZJLJPFYYNWJJTMYHZWZHFLZPPQHGSCYYYNJQYXXGJHHSDSJNKKTMOMLCRXYPSNQSECCQZGGLLYJLMYZZSECYKYYHQWJSSGGYXYZYJWWKDJHYCHMYXJTLXJYQBYXZLDWRDJRWYSRLDZJPCBZJJBRCFTLECZSTZFXXZHTRQHYBDLYCZSSYMMRFMYQZPWWJJYFCRWFDFZQPYDDWYXKYJAWJFFXYPSFTZYHHYZYSWCJYXSCLCXXWZZXNBGNNXBXLZSZSBSGPYSYZDHMDZBQBZCWDZZYYTZHBTSYYBZGNTNXQYWQSKBPHHLXGYBFMJEBJHHGQTJCYSXSTKZHLYCKGLYSMZXYALMELDCCXGZYRJXSDLTYZCQKCNNJWHJTZZCQLJSTSTBNXBTYXCEQXGKWJYFLZQLYHYXSPSFXLMPBYSXXXYDJCZYLLLSJXFHJXPJBTFFYABYXBHZZBJYZLWLCZGGBTSSMDTJZXPTHYQTGLJSCQFZKJZJQNLZWLSLHDZBWJNCJZYZSQQYCQYRZCJJWYBRTWPYFTWEXCSKDZCTBZHYZZYYJXZCFFZZMJYXXSDZZOTTBZLQWFCKSZSXFYRLNYJMBDTHJXSQQCCSBXYYTSYFBXDZTGBCNSLCYZZPSAZYZZSCJCSHZQYDXLBPJLLMQXTYDZXSQJTZPXLCGLQTZWJBHCTSYJSFXYEJJTLBGXSXJMYJQQPFZASYJNTYDJXKJCDJSZCBARTDCLYJQMWNQNCLLLKBYBZZSYHQQLTWLCCXTXLLZNTYLNEWYZYXCZXXGRKRMTCNDNJTSYYSSDQDGHSDBJGHRWRQLYBGLXHLGTGXBQJDZPYJSJYJCTMRNYMGRZJCZGJMZMGXMPRYXKJNYMSGMZJYMKMFXMLDTGFBHCJHKYLPFMDXLQJJSMTQGZSJLQDLDGJYCALCMZCSDJLLNXDJFFFFJCZFMZFFPFKHKGDPSXKTACJDHHZDDCRRCFQYJKQCCWJDXHWJLYLLZGCFCQDSMLZPBJJPLSBCJGGDCKKDEZSQCCKJGCGKDJTJDLZYCXKLQSCGJCLTFPCQCZGWPJDQYZJJBYJHSJDZWGFSJGZKQCCZLLPSPKJGQJHZZLJPLGJGJJTHJJYJZCZMLZLYQBGJWMLJKXZDZNJQSYZMLJLLJKYWXMKJLHSKJGBMCLYYMKXJQLBMLLKMDXXKWYXYSLMLPSJQQJQXYXFJTJDXMXXLLCXQBSYJBGWYMBGGBCYXPJYGPEPFGDJGBHBNSQJYZJKJKHXQFGQZKFHYGKHDKLLSDJQXPQYKYBNQSXQNSZSWHBSXWHXWBZZXDMNSJBSBKBBZKLYLXGWXDRWYQZMYWSJQLCJXXJXKJEQXSCYETLZHLYYYSDZPAQYZCMTLSHTZCFYZYXYLJSDCJQAGYSLCQLYYYSHMRQQKLDXZSCSSSYDYCJYSFSJBFRSSZQSBXXPXJYSDRCKGJLGDKZJZBDKTCSYQPYHSTCLDJDHMXMCGXYZHJDDTMHLTXZXYLYMOHYJCLTYFBQQXPFBDFHHTKSQHZYYWCNXXCRWHOWGYJLEGWDQCWGFJYCSNTMYTOLBYGWQWESJPWNMLRYDZSZTXYQPZGCWXHNGPYXSHMYQJXZTDPPBFYHZHTJYFDZWKGKZBLDNTSXHQEEGZZYLZMMZYJZGXZXKHKSTXNXXWYLYAPSTHXDWHZYMPXAGKYDXBHNHXKDPJNMYHYLPMGOCSLNZHKXXLPZZLBMLSFBHHGYGYYGGBHSCYAQTYWLXTZQCEZYDQDQMMHTKLLSZHLSJZWFYHQSWSCWLQAZYNYTLSXTHAZNKZZSZZLAXXZWWCTGQQTDDYZTCCHYQZFLXPSLZYGPZSZNGLNDQTBDLXGTCTAJDKYWNSYZLJHHZZCWNYYZYWMHYCHHYXHJKZWSXHZYXLYSKQYSPSLYZWMYPPKBYGLKZHTYXAXQSYSHXASMCHKDSCRSWJPWXSGZJLWWSCHSJHSQNHCSEGNDAQTBAALZZMSSTDQJCJKTSCJAXPLGGXHHGXXZCXPDMMHLDGTYBYSJMXHMRCPXXJZCKZXSHMLQXXTTHXWZFKHCCZDYTCJYXQHLXDHYPJQXYLSYYDZOZJNYXQEZYSQYAYXWYPDGXDDXSPPYZNDLTWRHXYDXZZJHTCXMCZLHPYYYYMHZLLHNXMYLLLMDCPPXHMXDKYCYRDLTXJCHHZZXZLCCLYLNZSHZJZZLNNRLWHYQSNJHXYNTTTKYJPYCHHYEGKCTTWLGQRLGGTGTYGYHPYHYLQYQGCWYQKPYYYTTTTLHYHLLTYTTSPLKYZXGZWGPYDSSZZDQXSKCQNMJJZZBXYQMJRTFFBTKHZKBXLJJKDXJTLBWFZPPTKQTZTGPDGNTPJYFALQMKGXBDCLZFHZCLLLLADPMXDJHLCCLGYHDZFGYDDGCYYFGYDXKSSEBDHYKDKDKHNAXXYBPBYYHXZQGAFFQYJXDMLJCSQZLLPCHBSXGJYNDYBYQSPZWJLZKSDDTACTBXZDYZYPJZQSJNKKTKNJDJGYYPGTLFYQKASDNTCYHBLWDZHBBYDWJRYGKZYHEYYFJMSDTYFZJJHGCXPLXHLDWXXJKYTCYKSSSMTWCTTQZLPBSZDZWZXGZAGYKTYWXLHLSPBCLLOQMMZSSLCMBJCSZZKYDCZJGQQDSMCYTZQQLWZQZXSSFPTTFQMDDZDSHDTDWFHTDYZJYQJQKYPBDJYYXTLJHDRQXXXHAYDHRJLKLYTWHLLRLLRCXYLBWSRSZZSYMKZZHHKYHXKSMDSYDYCJPBZBSQLFCXXXNXKXWYWSDZYQOGGQMMYHCDZTTFJYYBGSTTTYBYKJDHKYXBELHTYPJQNFXFDYKZHQKZBYJTZBXHFDXKDASWTAWAJLDYJSFHBLDNNTNQJTJNCHXFJSRFWHZFMDRYJYJWZPDJKZYJYMPCYZNYNXFBYTFYFWYGDBNZZZDNYTXZEMMQBSQEHXFZMBMFLZZSRXYMJGSXWZJSPRYDJSJGXHJJGLJJYNZZJXHGXKYMLPYYYCXYTWQZSWHWLYRJLPXSLSXMFSWWKLCTNXNYNPSJSZHDZEPTXMYYWXYYSYWLXJQZQXZDCLEEELMCPJPCLWBXSQHFWWTFFJTNQJHJQDXHWLBYZNFJLALKYYJLDXHHYCSTYYWNRJYXYWTRMDRQHWQCMFJDYZMHMYYXJWMYZQZXTLMRSPWWCHAQBXYGZYPXYYRRCLMPYMGKSJSZYSRMYJSNXTPLNBAPPYPYLXYYZKYNLDZYJZCZNNLMZHHARQMPGWQTZMXXMLLHGDZXYHXKYXYCJMFFYYHJFSBSSQLXXNDYCANNMTCJCYPRRNYTYQNYYMBMSXNDLYLYSLJRLXYSXQMLLYZLZJJJKYZZCSFBZXXMSTBJGNXYZHLXNMCWSCYZYFZLXBRNNNYLBNRTGZQYSATSWRYHYJZMZDHZGZDWYBSSCSKXSYHYTXXGCQGXZZSHYXJSCRHMKKBXCZJYJYMKQHZJFNBHMQHYSNJNZYBKNQMCLGQHWLZNZSWXKHLJHYYBQLBFCDSXDLDSPFZPSKJYZWZXZDDXJSMMEGJSCSSMGCLXXKYYYLNYPWWWGYDKZJGGGZGGSYCKNJWNJPCXBJJTQTJWDSSPJXZXNZXUMELPXFSXTLLXCLJXJJLJZXCTPSWXLYDHLYQRWHSYCSQYYBYAYWJJJQFWQCQQCJQGXALDBZZYJGKGXPLTZYFXJLTPADKYQHPMATLCPDCKBMTXYBHKLENXDLEEGQDYMSAWHZMLJTWYGXLYQZLJEEYYBQQFFNLYXRDSCTGJGXYYNKLLYQKCCTLHJLQMKKZGCYYGLLLJDZGYDHZWXPYSJBZKDZGYZZHYWYFQYTYZSZYEZZLYMHJJHTSMQWYZLKYYWZCSRKQYTLTDXWCTYJKLWSQZWBDCQYNCJSRSZJLKCDCDTLZZZACQQZZDDXYPLXZBQJYLZLLLQDDZQJYJYJZYXNYYYNYJXKXDAZWYRDLJYYYRJLXLLDYXJCYWYWNQCCLDDNYYYNYCKCZHXXCCLGZQJGKWPPCQQJYSBZZXYJSQPXJPZBSBDSFNSFPZXHDWZTDWPPTFLZZBZDMYYPQJRSDZSQZSQXBDGCPZSWDWCSQZGMDHZXMWWFYBPDGPHTMJTHZSMMBGZMBZJCFZWFZBBZMQCFMBDMCJXLGPNJBBXGYHYYJGPTZGZMQBQTCGYXJXLWZKYDPDYMGCFTPFXYZTZXDZXTGKMTYBBCLBJASKYTSSQYYMSZXFJEWLXLLSZBQJJJAKLYLXLYCCTSXMCWFKKKBSXLLLLJYXTYLTJYYTDPJHNHNNKBYQNFQYYZBYYESSESSGDYHFHWTCJBSDZZTFDMXHCNJZYMQWSRYJDZJQPDQBBSTJGGFBKJBXTGQHNGWJXJGDLLTHZHHYYYYYYSXWTYYYCCBDBPYPZYCCZYJPZYWCBDLFWZCWJDXXHYHLHWZZXJTCZLCDPXUJCZZZLYXJJTXPHFXWPYWXZPTDZZBDZCYHJHMLXBQXSBYLRDTGJRRCTTTHYTCZWMXFYTWWZCWJWXJYWCSKYBZSCCTZQNHXNWXXKHKFHTSWOCCJYBCMPZZYKBNNZPBZHHZDLSYDDYTYFJPXYNGFXBYQXCBHXCPSXTYZDMKYSNXSXLHKMZXLYHDHKWHXXSSKQYHHCJYXGLHZXCSNHEKDTGZXQYPKDHEXTYKCNYMYYYPKQYYYKXZLTHJQTBYQHXBMYHSQCKWWYLLHCYYLNNEQXQWMCFBDCCMLJGGXDQKTLXKGNQCDGZJWYJJLYHHQTTTNWCHMXCXWHWSZJYDJCCDBQCDGDNYXZTHCQRXCBHZTQCBXWGQWYYBXHMBYMYQTYEXMQKYAQYRGYZSLFYKKQHYSSQYSHJGJCNXKZYCXSBXYXHYYLSTYCXQTHYSMGSCPMMGCCCCCMTZTASMGQZJHKLOSQYLSWTMXSYQKDZLJQQYPLSYCZTCQQPBBQJZCLPKHQZYYXXDTDDTSJCXFFLLCHQXMJLWCJCXTSPYCXNDTJSHJWXDQQJSKXYAMYLSJHMLALYKXCYYDMNMDQMXMCZNNCYBZKKYFLMCHCMLHXRCJJHSYLNMTJZGZGYWJXSRXCWJGJQHQZDQJDCJJZKJKGDZQGJJYJYLXZXXCDQHHHEYTMHLFSBDJSYYSHFYSTCZQLPBDRFRZTZYKYWHSZYQKWDQZRKMSYNBCRXQBJYFAZPZZEDZCJYWBCJWHYJBQSZYWRYSZPTDKZPFPBNZTKLQYHBBZPNPPTYZZYBQNYDCPJMMCYCQMCYFZZDCMNLFPBPLNGQJTBTTNJZPZBBZNJKLJQYLNBZQHKSJZNGGQSZZKYXSHPZSNBCGZKDDZQANZHJKDRTLZLSWJLJZLYWTJNDJZJHXYAYNCBGTZCSSQMNJPJYTYSWXZFKWJQTKHTZPLBHSNJZSYZBWZZZZLSYLSBJHDWWQPSLMMFBJDWAQYZTCJTBNNWZXQXCDSLQGDSDPDZHJTQQPSWLYYJZLGYXYZLCTCBJTKTYCZJTQKBSJLGMGZDMCSGPYNJZYQYYKNXRPWSZXMTNCSZZYXYBYHYZAXYWQCJTLLCKJJTJHGDXDXYQYZZBYWDLWQCGLZGJGQRQZCZSSBCRPCSKYDZNXJSQGXSSJMYDNSTZTPBDLTKZWXQWQTZEXNQCZGWEZKSSBYBRTSSSLCCGBPSZQSZLCCGLLLZXHZQTHCZMQGYZQZNMCOCSZJMMZSQPJYGQLJYJPPLDXRGZYXCCSXHSHGTZNLZWZKJCXTCFCJXLBMQBCZZWPQDNHXLJCTHYZLGYLNLSZZPCXDSCQQHJQKSXZPBAJYEMSMJTZDXLCJYRYYNWJBNGZZTMJXLTBSLYRZPYLSSCNXPHLLHYLLQQZQLXYMRSYCXZLMMCZLTZSDWTJJLLNZGGQXPFSKYGYGHBFZPDKMWGHCXMSGDXJMCJZDYCABXJDLNBCDQYGSKYDQTXDJJYXMSZQAZDZFSLQXYJSJZYLBTXXWXQQZBJZUFBBLYLWDSLJHXJYZJWTDJCZFQZQZZDZSXZZQLZCDZFJHYSPYMPQZMLPPLFFXJJNZZYLSJEYQZFPFZKSYWJJJHRDJZZXTXXGLGHYDXCSKYSWMMZCWYBAZBJKSHFHJCXMHFQHYXXYZFTSJYZFXYXPZLCHMZMBXHZZSXYFYMNCWDABAZLXKTCSHHXKXJJZJSTHYGXSXYYHHHJWXKZXSSBZZWHHHCWTZZZPJXSNXQQJGZYZYWLLCWXZFXXYXYHXMKYYSWSQMNLNAYCYSPMJKHWCQHYLAJJMZXHMMCNZHBHXCLXTJPLTXYJHDYYLTTXFSZHYXXSJBJYAYRSMXYPLCKDUYHLXRLNLLSTYZYYQYGYHHSCCSMZCTZQXKYQFPYYRPFFLKQUNTSZLLZMWWTCQQYZWTLLMLMPWMBZSSTZRBPDDTLQJJBXZCSRZQQYGWCSXFWZLXCCRSZDZMCYGGDZQSGTJSWLJMYMMZYHFBJDGYXCCPSHXNZCSBSJYJGJMPPWAFFYFNXHYZXZYLREMZGZCYZSSZDLLJCSQFNXZKPTXZGXJJGFMYYYSNBTYLBNLHPFZDCYFBMGQRRSSSZXYSGTZRNYDZZCDGPJAFJFZKNZBLCZSZPSGCYCJSZLMLRSZBZZLDLSLLYSXSQZQLYXZLSKKBRXBRBZCYCXZZZEEYFGKLZLYYHGZSGZLFJHGTGWKRAAJYZKZQTSSHJJXDCYZUYJLZYRZDQQHGJZXSSZBYKJPBFRTJXLLFQWJHYLQTYMBLPZDXTZYGBDHZZRBGXHWNJTJXLKSCFSMWLSDQYSJTXKZSCFWJLBXFTZLLJZLLQBLSQMQQCGCZFPBPHZCZJLPYYGGDTGWDCFCZQYYYQYSSCLXZSKLZZZGFFCQNWGLHQYZJJCZLQZZYJPJZZBPDCCMHJGXDQDGDLZQMFGPSYTSDYFWWDJZJYSXYYCZCYHZWPBYKXRYLYBHKJKSFXTZJMMCKHLLTNYYMSYXYZPYJQYCSYCWMTJJKQYRHLLQXPSGTLYYCLJSCPXJYZFNMLRGJJTYZBXYZMSJYJHHFZQMSYXRSZCWTLRTQZSSTKXGQKGSPTGCZNJSJCQCXHMXGGZTQYDJKZDLBZSXJLHYQGGGTHQSZPYHJHHGYYGKGGCWJZZYLCZLXQSFTGZSLLLMLJSKCTBLLZZSZMMNYTPZSXQHJCJYQXYZXZQZCPSHKZZYSXCDFGMWQRLLQXRFZTLYSTCTMJCXJJXHJNXTNRZTZFQYHQGLLGCXSZSJDJLJCYDSJTLNYXHSZXCGJZYQPYLFHDJSBPCCZHJJJQZJQDYBSSLLCMYTTMQTBHJQNNYGKYRQYQMZGCJKPDCGMYZHQLLSLLCLMHOLZGDYYFZSLJCQZLYLZQJESHNYLLJXGJXLYSYYYXNBZLJSSZCQQCJYLLZLTJYLLZLLBNYLGQCHXYYXOXCXQKYJXXXYKLXSXXYQXCYKQXQCSGYXXYQXYGYTQOHXHXPYXXXULCYEYCHZZCBWQBBWJQZSCSZSSLZYLKDESJZWMYMCYTSDSXXSCJPQQSQYLYYZYCMDJDZYWCBTJSYDJKCYDDJLBDJJSODZYSYXQQYXDHHGQQYQHDYXWGMMMAJDYBBBPPBCMUUPLJZSMTXERXJMHQNUTPJDCBSSMSSSTKJTSSMMTRCPLZSZMLQDSDMJMQPNQDXCFYNBFSDQXYXHYAYKQYDDLQYYYSSZBYDSLNTFQTZQPZMCHDHCZCWFDXTMYQSPHQYYXSRGJCWTJTZZQMGWJJTJHTQJBBHWZPXXHYQFXXQYWYYHYSCDYDHHQMNMTMWCPBSZPPZZGLMZFOLLCFWHMMSJZTTDHZZYFFYTZZGZYSKYJXQYJZQBHMBZZLYGHGFMSHPZFZSNCLPBQSNJXZSLXXFPMTYJYGBXLLDLXPZJYZJYHHZCYWHJYLSJEXFSZZYWXKZJLUYDTMLYMQJPWXYHXSKTQJEZRPXXZHHMHWQPWQLYJJQJJZSZCPHJLCHHNXJLQWZJHBMZYXBDHHYPZLHLHLGFWLCHYYTLHJXCJMSCPXSTKPNHQXSRTYXXTESYJCTLSSLSTDLLLWWYHDHRJZSFGXTSYCZYNYHTDHWJSLHTZDQDJZXXQHGYLTZPHCSQFCLNJTCLZPFSTPDYNYLGMJLLYCQHYSSHCHYLHQYQTMZYPBYWRFQYKQSYSLZDQJMPXYYSSRHZJNYWTQDFZBWWTWWRXCWHGYHXMKMYYYQMSMZHNGCEPMLQQMTCWCTMMPXJPJJHFXYYZSXZHTYBMSTSYJTTQQQYYLHYNPYQZLCYZHZWSMYLKFJXLWGXYPJYTYSYXYMZCKTTWLKSMZSYLMPWLZWXWQZSSAQSYXYRHSSNTSRAPXCPWCMGDXHXZDZYFJHGZTTSBJHGYZSZYSMYCLLLXBTYXHBBZJKSSDMALXHYCFYGMQYPJYCQXJLLLJGSLZGQLYCJCCZOTYXMTMTTLLWTGPXYMZMKLPSZZZXHKQYSXCTYJZYHXSHYXZKXLZWPSQPYHJWPJPWXQQYLXSDHMRSLZZYZWTTCYXYSZZSHBSCCSTPLWSSCJCHNLCGCHSSPHYLHFHHXJSXYLLNYLSZDHZXYLSXLWZYKCLDYAXZCMDDYSPJTQJZLNWQPSSSWCTSTSZLBLNXSMNYYMJQBQHRZWTYYDCHQLXKPZWBGQYBKFCMZWPZLLYYLSZYDWHXPSBCMLJBSCGBHXLQHYRLJXYSWXWXZSLDFHLSLYNJLZYFLYJYCDRJLFSYZFSLLCQYQFGJYHYXZLYLMSTDJCYHBZLLNWLXXYGYYHSMGDHXXHHLZZJZXCZZZCYQZFNGWPYLCPKPYYPMCLQKDGXZGGWQBDXZZKZFBXXLZXJTPJPTTBYTSZZDWSLCHZHSLTYXHQLHYXXXYYZYSWTXZKHLXZXZPYHGCHKCFSYHUTJRLXFJXPTZTWHPLYXFCRHXSHXKYXXYHZQDXQWULHYHMJTBFLKHTXCWHJFWJCFPQRYQXCYYYQYGRPYWSGSUNGWCHKZDXYFLXXHJJBYZWTSXXNCYJJYMSWZJQRMHXZWFQSYLZJZGBHYNSLBGTTCSYBYXXWXYHXYYXNSQYXMQYWRGYQLXBBZLJSYLPSYTJZYHYZAWLRORJMKSCZJXXXYXCHDYXRYXXJDTSQFXLYLTSFFYXLMTYJMJUYYYXLTZCSXQZQHZXLYYXZHDNBRXXXJCTYHLBRLMBRLLAXKYLLLJLYXXLYCRYLCJTGJCMTLZLLCYZZPZPCYAWHJJFYBDYYZSMPCKZDQYQPBPCJPDCYZMDPBCYYDYCNNPLMTMLRMFMMGWYZBSJGYGSMZQQQZTXMKQWGXLLPJGZBQCDJJJFPKJKCXBLJMSWMDTQJXLDLPPBXCWRCQFBFQJCZAHZGMYKPHYYHZYKNDKZMBPJYXPXYHLFPNYYGXJDBKXNXHJMZJXSTRSTLDXSKZYSYBZXJLXYSLBZYSLHXJPFXPQNBYLLJQKYGZMCYZZYMCCSLCLHZFWFWYXZMWSXTYNXJHPYYMCYSPMHYSMYDYSHQYZCHMJJMZCAAGCFJBBHPLYZYLXXSDJGXDHKXXTXXNBHRMLYJSLTXMRHNLXQJXYZLLYSWQGDLBJHDCGJYQYCMHWFMJYBMBYJYJWYMDPWHXQLDYGPDFXXBCGJSPCKRSSYZJMSLBZZJFLJJJLGXZGYXYXLSZQYXBEXYXHGCXBPLDYHWETTWWCJMBTXCHXYQXLLXFLYXLLJLSSFWDPZSMYJCLMWYTCZPCHQEKCQBWLCQYDPLQPPQZQFJQDJHYMMCXTXDRMJWRHXCJZYLQXDYYNHYYHRSLSRSYWWZJYMTLTLLGTQCJZYABTCKZCJYCCQLJZQXALMZYHYWLWDXZXQDLLQSHGPJFJLJHJABCQZDJGTKHSSTCYJLPSWZLXZXRWGLDLZRLZXTGSLLLLZLYXXWGDZYGBDPHZPBRLWSXQBPFDWOFMWHLYPCBJCCLDMBZPBZZLCYQXLDOMZBLZWPDWYYGDSTTHCSQSCCRSSSYSLFYBFNTYJSZDFNDPDHDZZMBBLSLCMYFFGTJJQWFTMTPJWFNLBZCMMJTGBDZLQLPYFHYYMJYLSDCHDZJWJCCTLJCLDTLJJCPDDSQDSSZYBNDBJLGGJZXSXNLYCYBJXQYCBYLZCFZPPGKCXZDZFZTJJFJSJXZBNZYJQTTYJYHTYCZHYMDJXTTMPXSPLZCDWSLSHXYPZGTFMLCJTYCBPMGDKWYCYZCDSZZYHFLYCTYGWHKJYYLSJCXGYWJCBLLCSNDDBTZBSCLYZCZZSSQDLLMQYYHFSLQLLXFTYHABXGWNYWYYPLLSDLDLLBJCYXJZMLHLJDXYYQYTDLLLBUGBFDFBBQJZZMDPJHGCLGMJJPGAEHHBWCQXAXHHHZCHXYPHJAXHLPHJPGPZJQCQZGJJZZUZDMQYYBZZPHYHYBWHAZYJHYKFGDPFQSDLZMLJXKXGALXZDAGLMDGXMWZQYXXDXXPFDMMSSYMPFMDMMKXKSYZYSHDZKXSYSMMZZZMSYDNZZCZXFPLSTMZDNMXCKJMZTYYMZMZZMSXHHDCZJEMXXKLJSTLWLSQLYJZLLZJSSDPPMHNLZJCZYHMXXHGZCJMDHXTKGRMXFWMCGMWKDTKSXQMMMFZZYDKMSCLCMPCGMHSPXQPZDSSLCXKYXTWLWJYAHZJGZQMCSNXYYMMPMLKJXMHLMLQMXCTKZMJQYSZJSYSZHSYJZJCDAJZYBSDQJZGWZQQXFKDMSDJLFWEHKZQKJPEYPZYSZCDWYJFFMZZYLTTDZZEFMZLBNPPLPLPEPSZALLTYLKCKQZKGENQLWAGYXYDPXLHSXQQWQCQXQCLHYXXMLYCCWLYMQYSKGCHLCJNSZKPYZKCQZQLJPDMDZHLASXLBYDWQLWDNBQCRYDDZTJYBKBWSZDXDTNPJDTCTQDFXQQMGNXECLTTBKPWSLCTYQLPWYZZKLPYGZCQQPLLKCCYLPQMZCZQCLJSLQZDJXLDDHPZQDLJJXZQDXYZQKZLJCYQDYJPPYPQYKJYRMPCBYMCXKLLZLLFQPYLLLMBSGLCYSSLRSYSQTMXYXZQZFDZUYSYZTFFMZZSMZQHZSSCCMLYXWTPZGXZJGZGSJSGKDDHTQGGZLLBJDZLCBCHYXYZHZFYWXYZYMSDBZZYJGTSMTFXQYXQSTDGSLNXDLRYZZLRYYLXQHTXSRTZNGZXBNQQZFMYKMZJBZYMKBPNLYZPBLMCNQYZZZSJZHJCTZKHYZZJRDYZHNPXGLFZTLKGJTCTSSYLLGZRZBBQZZKLPKLCZYSSUYXBJFPNJZZXCDWXZYJXZZDJJKGGRSRJKMSMZJLSJYWQSKYHQJSXPJZZZLSNSHRNYPZTWCHKLPSRZLZXYJQXQKYSJYCZTLQZYBBYBWZPQDWWYZCYTJCJXCKCWDKKZXSGKDZXWWYYJQYYTCYTDLLXWKCZKKLCCLZCQQDZLQLCSFQCHQHSFSMQZZLNBJJZBSJHTSZDYSJQJPDLZCDCWJKJZZLPYCGMZWDJJBSJQZSYZYHHXJPBJYDSSXDZNCGLQMBTSFSBPDZDLZNFGFJGFSMPXJQLMBLGQCYYXBQKDJJQYRFKZTJDHCZKLBSDZCFJTPLLJGXHYXZCSSZZXSTJYGKGCKGYOQXJPLZPBPGTGYJZGHZQZZLBJLSQFZGKQQJZGYCZBZQTLDXRJXBSXXPZXHYZYCLWDXJJHXMFDZPFZHQHQMQGKSLYHTYCGFRZGNQXCLPDLBZCSCZQLLJBLHBZCYPZZPPDYMZZSGYHCKCPZJGSLJLNSCDSLDLXBMSTLDDFJMKDJDHZLZXLSZQPQPGJLLYBDSZGQLBZLSLKYYHZTTNTJYQTZZPSZQZTLLJTYYLLQLLQYZQLBDZLSLYYZYMDFSZSNHLXZNCZQZPBWSKRFBSYZMTHBLGJPMCZZLSTLXSHTCSYZLZBLFEQHLXFLCJLYLJQCBZLZJHHSSTBRMHXZHJZCLXFNBGXGTQJCZTMSFZKJMSSNXLJKBHSJXNTNLZDNTLMSJXGZJYJCZXYJYJWRWWQNZTNFJSZPZSHZJFYRDJSFSZJZBJFZQZZHZLXFYSBZQLZSGYFTZDCSZXZJBQMSZKJRHYJZCKMJKHCHGTXKXQGLXPXFXTRTYLXJXHDTSJXHJZJXZWZLCQSBTXWXGXTXXHXFTSDKFJHZYJFJXRZSDLLLTQSQQZQWZXSYQTWGWBZCGZLLYZBCLMQQTZHZXZXLJFRMYZFLXYSQXXJKXRMQDZDMMYYBSQBHGZMWFWXGMXLZPYYTGZYCCDXYZXYWGSYJYZNBHPZJSQSYXSXRTFYZGRHZTXSZZTHCBFCLSYXZLZQMZLMPLMXZJXSFLBYZMYQHXJSXRXSQZZZSSLYFRCZJRCRXHHZXQYDYHXSJJHZCXZBTYNSYSXJBQLPXZQPYMLXZKYXLXCJLCYSXXZZLXDLLLJJYHZXGYJWKJRWYHCPSGNRZLFZWFZZNSXGXFLZSXZZZBFCSYJDBRJKRDHHGXJLJJTGXJXXSTJTJXLYXQFCSGSWMSBCTLQZZWLZZKXJMLTMJYHSDDBXGZHDLBMYJFRZFSGCLYJBPMLYSMSXLSZJQQHJZFXGFQFQBPXZGYYQXGZTCQWYLTLGWSGWHRLFSFGZJMGMGBGTJFSYZZGZYZAFLSSPMLPFLCWBJZCLJJMZLPJJLYMQDMYYYFBGYGYZMLYZDXQYXRQQQHSYYYQXYLJTYXFSFSLLGNQCYHYCWFHCCCFXPYLYPLLZYXXXXXKQHHXSHJZCFZSCZJXCPZWHHHHHAPYLQALPQAFYHXDYLUKMZQGGGDDESRNNZLTZGCHYPPYSQJJHCLLJTOLNJPZLJLHYMHEYDYDSQYCDDHGZUNDZCLZYZLLZNTNYZGSLHSLPJJBDGWXPCDUTJCKLKCLWKLLCASSTKZZDNQNTTLYYZSSYSSZZRYLJQKCQDHHCRXRZYDGRGCWCGZQFFFPPJFZYNAKRGYWYQPQXXFKJTSZZXSWZDDFBBXTBGTZKZNPZZPZXZPJSZBMQHKCYXYLDKLJNYPKYGHGDZJXXEAHPNZKZTZCMXCXMMJXNKSZQNMNLWBWWXJKYHCPSTMCSQTZJYXTPCTPDTNNPGLLLZSJLSPBLPLQHDTNJNLYYRSZFFJFQWDPHZDWMRZCCLODAXNSSNYZRESTYJWJYJDBCFXNMWTTBYLWSTSZGYBLJPXGLBOCLHPCBJLTMXZLJYLZXCLTPNCLCKXTPZJSWCYXSFYSZDKNTLBYJCYJLLSTGQCBXRYZXBXKLYLHZLQZLNZCXWJZLJZJNCJHXMNZZGJZZXTZJXYCYYCXXJYYXJJXSSSJSTSSTTPPGQTCSXWZDCSYFPTFBFHFBBLZJCLZZDBXGCXLQPXKFZFLSYLTUWBMQJHSZBMDDBCYSCCLDXYCDDQLYJJWMQLLCSGLJJSYFPYYCCYLTJANTJJPWYCMMGQYYSXDXQMZHSZXPFTWWZQSWQRFKJLZJQQYFBRXJHHFWJJZYQAZMYFRHCYYBYQWLPEXCCZSTYRLTTDMQLYKMBBGMYYJPRKZNPBSXYXBHYZDJDNGHPMFSGMWFZMFQMMBCMZZCJJLCNUXYQLMLRYGQZCYXZLWJGCJCGGMCJNFYZZJHYCPRRCMTZQZXHFQGTJXCCJEAQCRJYHPLQLSZDJRBCQHQDYRHYLYXJSYMHZYDWLDFRYHBPYDTSSCNWBXGLPZMLZZTQSSCPJMXXYCSJYTYCGHYCJWYRXXLFEMWJNMKLLSWTXHYYYNCMMCWJDQDJZGLLJWJRKHPZGGFLCCSCZMCBLTBHBQJXQDSPDJZZGKGLFQYWBZYZJLTSTDHQHCTCBCHFLQMPWDSHYYTQWCNZZJTLBYMBPDYYYXSQKXWYYFLXXNCWCXYPMAELYKKJMZZZBRXYYQJFLJPFHHHYTZZXSGQQMHSPGDZQWBWPJHZJDYSCQWZKTXXSQLZYYMYSDZGRXCKKUJLWPYSYSCSYZLRMLQSYLJXBCXTLWDQZPCYCYKPPPNSXFYZJJRCEMHSZMSXLXGLRWGCSTLRSXBZGBZGZTCPLUJLSLYLYMTXMTZPALZXPXJTJWTCYYZLBLXBZLQMYLXPGHDSLSSDMXMBDZZSXWHAMLCZCPJMCNHJYSNSYGCHSKQMZZQDLLKABLWJXSFMOCDXJRRLYQZKJMYBYQLYHETFJZFRFKSRYXFJTWDSXXSYSQJYSLYXWJHSNLXYYXHBHAWHHJZXWMYLJCSSLKYDZTXBZSYFDXGXZJKHSXXYBSSXDPYNZWRPTQZCZENYGCXQFJYKJBZMLJCMQQXUOXSLYXXLYLLJDZBTYMHPFSTTQQWLHOKYBLZZALZXQLHZWRRQHLSTMYPYXJJXMQSJFNBXYXYJXXYQYLTHYLQYFMLKLJTMLLHSZWKZHLJMLHLJKLJSTLQXYLMBHHLNLZXQJHXCFXXLHYHJJGBYZZKBXSCQDJQDSUJZYYHZHHMGSXCSYMXFEBCQWWRBPYYJQTYZCYQYQQZYHMWFFHGZFRJFCDPXNTQYZPDYKHJLFRZXPPXZDBBGZQSTLGDGYLCQMLCHHMFYWLZYXKJLYPQHSYWMQQGQZMLZJNSQXJQSYJYCBEHSXFSZPXZWFLLBCYYJDYTDTHWZSFJMQQYJLMQXXLLDTTKHHYBFPWTYYSQQWNQWLGWDEBZWCMYGCULKJXTMXMYJSXHYBRWFYMWFRXYQMXYSZTZZTFYKMLDHQDXWYYNLCRYJBLPSXCXYWLSPRRJWXHQYPHTYDNXHHMMYWYTZCSQMTSSCCDALWZTCPQPYJLLQZYJSWXMZZMMYLMXCLMXCZMXMZSQTZPPQQBLPGXQZHFLJJHYTJSRXWZXSCCDLXTYJDCQJXSLQYCLZXLZZXMXQRJMHRHZJBHMFLJLMLCLQNLDXZLLLPYPSYJYSXCQQDCMQJZZXHNPNXZMEKMXHYKYQLXSXTXJYYHWDCWDZHQYYBGYBCYSCFGPSJNZDYZZJZXRZRQJJYMCANYRJTLDPPYZBSTJKXXZYPFDWFGZZRPYMTNGXZQBYXNBUFNQKRJQZMJEGRZGYCLKXZDSKKNSXKCLJSPJYYZLQQJYBZSSQLLLKJXTBKTYLCCDDBLSPPFYLGYDTZJYQGGKQTTFZXBDKTYYHYBBFYTYYBCLPDYTGDHRYRNJSPTCSNYJQHKLLLZSLYDXXWBCJQSPXBPJZJCJDZFFXXBRMLAZHCSNDLBJDSZBLPRZTSWSBXBCLLXXLZDJZSJPYLYXXYFTFFFBHJJXGBYXJPMMMPSSJZJMTLYZJXSWXTYLEDQPJMYGQZJGDJLQJWJQLLSJGJGYGMSCLJJXDTYGJQJQJCJZCJGDZZSXQGSJGGCXHQXSNQLZZBXHSGZXCXYLJXYXYYDFQQJHJFXDHCTXJYRXYSQTJXYEFYYSSYYJXNCYZXFXMSYSZXYYSCHSHXZZZGZZZGFJDLTYLNPZGYJYZYYQZPBXQBDZTZCZYXXYHHSQXSHDHGQHJHGYWSZTMZMLHYXGEBTYLZKQWYTJZRCLEKYSTDBCYKQQSAYXCJXWWGSBHJYZYDHCSJKQCXSWXFLTYNYZPZCCZJQTZWJQDZZZQZLJJXLSBHPYXXPSXSHHEZTXFPTLQYZZXHYTXNCFZYYHXGNXMYWXTZSJPTHHGYMXMXQZXTSBCZYJYXXTYYZYPCQLMMSZMJZZLLZXGXZAAJZYXJMZXWDXZSXZDZXLEYJJZQBHZWZZZQTZPSXZTDSXJJJZNYAZPHXYYSRNQDTHZHYYKYJHDZXZLSWCLYBZYECWCYCRYLCXNHZYDZYDYJDFRJJHTRSQTXYXJRJHOJYNXELXSFSFJZGHPZSXZSZDZCQZBYYKLSGSJHCZSHDGQGXYZGXCHXZJWYQWGYHKSSEQZZNDZFKWYSSTCLZSTSYMCDHJXXYWEYXCZAYDMPXMDSXYBSQMJMZJMTZQLPJYQZCGQHXJHHLXXHLHDLDJQCLDWBSXFZZYYSCHTYTYYBHECXHYKGJPXHHYZJFXHWHBDZFYZBCAPNPGNYDMSXHMMMMAMYNBYJTMPXYYMCTHJBZYFCGTYHWPHFTWZZEZSBZEGPFMTSKFTYCMHFLLHGPZJXZJGZJYXZSBBQSCZZLZCCSTPGXMJSFTCCZJZDJXCYBZLFCJSYZFGSZLYBCWZZBYZDZYPSWYJZXZBDSYUXLZZBZFYGCZXBZHZFTPBGZGEJBSTGKDMFHYZZJHZLLZZGJQZLSFDJSSCBZGPDLFZFZSZYZYZSYGCXSNXXCHCZXTZZLJFZGQSQYXZJQDCCZTQCDXZJYQJQCHXZTDLGSCXZSYQJQTZWLQDQZTQCHQQJZYEZZZPBWKDJFCJPZTYPQYQTTYNLMBDKTJZPQZQZZFPZSBNJLGYJDXJDZZKZGQKXDLPZJTCJDQBXDJQJSTCKNXBXZMSLYJCQMTJQWWCJQNJNLLLHJCWQTBZQYDZCZPZZDZYDDCYZZZCCJTTJFZDPRRTZTJDCQTQZDTJNPLZBCLLCTZSXKJZQZPZLBZRBTJDCXFCZDBCCJJLTQQPLDCGZDBBZJCQDCJWYNLLZYZCCDWLLXWZLXRXNTQQCZXKQLSGDFQTDDGLRLAJJTKUYMKQLLTZYTDYYCZGJWYXDXFRSKSTQTENQMRKQZHHQKDLDAZFKYPBGGPZREBZZYKZZSPEGJXGYKQZZZSLYSYYYZWFQZYLZZLZHWCHKYPQGNPGBLPLRRJYXCCSYYHSFZFYBZYYTGZXYLXCZWXXZJZBLFFLGSKHYJZEYJHLPLLLLCZGXDRZELRHGKLZZYHZLYQSZZJZQLJZFLNBHGWLCZCFJYSPYXZLZLXGCCPZBLLCYBBBBUBBCBPCRNNZCZYRBFSRLDCGQYYQXYGMQZWTZYTYJXYFWTEHZZJYWLCCNTZYJJZDEDPZDZTSYQJHDYMBJNYJZLXTSSTPHNDJXXBYXQTZQDDTJTDYYTGWSCSZQFLSHLGLBCZPHDLYZJYCKWTYTYLBNYTSDSYCCTYSZYYEBHEXHQDTWNYGYCLXTSZYSTQMYGZAZCCSZZDSLZCLZRQXYYELJSBYMXSXZTEMBBLLYYLLYTDQYSHYMRQWKFKBFXNXSBYCHXBWJYHTQBPBSBWDZYLKGZSKYHXQZJXHXJXGNLJKZLYYCDXLFYFGHLJGJYBXQLYBXQPQGZTZPLNCYPXDJYQYDYMRBESJYYHKXXSTMXRCZZYWXYQYBMCLLYZHQYZWQXDBXBZWZMSLPDMYSKFMZKLZCYQYCZLQXFZZYDQZPZYGYJYZMZXDZFYFYTTQTZHGSPCZMLCCYTZXJCYTJMKSLPZHYSNZLLYTPZCTZZCKTXDHXXTQCYFKSMQCCYYAZHTJPCYLZLYJBJXTPNYLJYYNRXSYLMMNXJSMYBCSYSYLZYLXJJQYLDZLPQBFZZBLFNDXQKCZFYWHGQMRDSXYCYTXNQQJZYYPFZXDYZFPRXEJDGYQBXRCNFYYQPGHYJDYZXGRHTKYLNWDZNTSMPKLBTHBPYSZBZTJZSZZJTYYXZPHSSZZBZCZPTQFZMYFLYPYBBJQXZMXXDJMTSYSKKBJZXHJCKLPSMKYJZCXTMLJYXRZZQSLXXQPYZXMKYXXXJCLJPRMYYGADYSKQLSNDHYZKQXZYZTCGHZTLMLWZYBWSYCTBHJHJFCWZTXWYTKZLXQSHLYJZJXTMPLPYCGLTBZZTLZJCYJGDTCLKLPLLQPJMZPAPXYZLKKTKDZCZZBNZDYDYQZJYJGMCTXLTGXSZLMLHBGLKFWNWZHDXUHLFMKYSLGXDTWWFRJEJZTZHYDXYKSHWFZCQSHKTMQQHTZHYMJDJSKHXZJZBZZXYMPAGQMSTPXLSKLZYNWRTSQLSZBPSPSGZWYHTLKSSSWHZZLYYTNXJGMJSZSUFWNLSOZTXGXLSAMMLBWLDSZYLAKQCQCTMYCFJBSLXCLZZCLXXKSBZQCLHJPSQPLSXXCKSLNHPSFQQYTXYJZLQLDXZQJZDYYDJNZPTUZDSKJFSLJHYLZSQZLBTXYDGTQFDBYAZXDZHZJNHHQBYKNXJJQCZMLLJZKSPLDYCLBBLXKLELXJLBQYCXJXGCNLCQPLZLZYJTZLJGYZDZPLTQCSXFDMNYCXGBTJDCZNBGBQYQJWGKFHTNPYQZQGBKPBBYZMTJDYTBLSQMPSXTBNPDXKLEMYYCJYNZCTLDYKZZXDDXHQSHDGMZSJYCCTAYRZLPYLTLKXSLZCGGEXCLFXLKJRTLQJAQZNCMBYDKKCXGLCZJZXJHPTDJJMZQYKQSECQZDSHHADMLZFMMZBGNTJNNLGBYJBRBTMLBYJDZXLCJLPLDLPCQDHLXZLYCBLCXZZJADJLNZMMSSSMYBHBSQKBHRSXXJMXSDZNZPXLGBRHWGGFCXGMSKLLTSJYYCQLTSKYWYYHYWXBXQYWPYWYKQLSQPTNTKHQCWDQKTWPXXHCPTHTWUMSSYHBWCRWXHJMKMZNGWTMLKFGHKJYLSYYCXWHYECLQHKQHTTQKHFZLDXQWYZYYDESBPKYRZPJFYYZJCEQDZZDLATZBBFJLLCXDLMJSSXEGYGSJQXCWBXSSZPDYZCXDNYXPPZYDLYJCZPLTXLSXYZYRXCYYYDYLWWNZSAHJSYQYHGYWWAXTJZDAXYSRLTDPSSYYFNEJDXYZHLXLLLZQZSJNYQYQQXYJGHZGZCYJCHZLYCDSHWSHJZYJXCLLNXZJJYYXNFXMWFPYLCYLLABWDDHWDXJMCXZTZPMLQZHSFHZYNZTLLDYWLSLXHYMMYLMBWWKYXYADTXYLLDJPYBPWUXJMWMLLSAFDLLYFLBHHHBQQLTZJCQJLDJTFFKMMMBYTHYGDCQRDDWRQJXNBYSNWZDBYYTBJHPYBYTTJXAAHGQDQTMYSTQXKBTZPKJLZRBEQQSSMJJBDJOTGTBXPGBKTLHQXJJJCTHXQDWJLWRFWQGWSHCKRYSWGFTGYGBXSDWDWRFHWYTJJXXXJYZYSLPYYYPAYXHYDQKXSHXYXGSKQHYWFDDDPPLCJLQQEEWXKSYYKDYPLTJTHKJLTCYYHHJTTPLTZZCDLTHQKZXQYSTEEYWYYZYXXYYSTTJKLLPZMCYHQGXYHSRMBXPLLNQYDQHXSXXWGDQBSHYLLPJJJTHYJKYPPTHYYKTYEZYENMDSHLCRPQFDGFXZPSFTLJXXJBSWYYSKSFLXLPPLBBBLBSFXFYZBSJSSYLPBBFFFFSSCJDSTZSXZRYYSYFFSYZYZBJTBCTSBSDHRTJJBYTCXYJEYLXCBNEBJDSYXYKGSJZBXBYTFZWGENYHHTHZHHXFWGCSTBGXKLSXYWMTMBYXJSTZSCDYQRCYTWXZFHMYMCXLZNSDJTTTXRYCFYJSBSDYERXJLJXBBDEYNJGHXGCKGSCYMBLXJMSZNSKGXFBNBPTHFJAAFXYXFPXMYPQDTZCXZZPXRSYWZDLYBBKTYQPQJPZYPZJZNJPZJLZZFYSBTTSLMPTZRTDXQSJEHBZYLZDHLJSQMLHTXTJECXSLZZSPKTLZKQQYFSYGYWPCPQFHQHYTQXZKRSGTTSQCZLPTXCDYYZXSQZSLXLZMYCPCQBZYXHBSXLZDLTCDXTYLZJYYZPZYZLTXJSJXHLPMYTXCQRBLZSSFJZZTNJYTXMYJHLHPPLCYXQJQQKZZSCPZKSWALQSBLCCZJSXGWWWYGYKTJBBZTDKHXHKGTGPBKQYSLPXPJCKBMLLXDZSTBKLGGQKQLSBKKTFXRMDKBFTPZFRTBBRFERQGXYJPZSSTLBZTPSZQZSJDHLJQLZBPMSMMSXLQQNHKNBLRDDNXXDHDDJCYYGYLXGZLXSYGMQQGKHBPMXYXLYTQWLWGCPBMQXCYZYDRJBHTDJYHQSHTMJSBYPLWHLZFFNYPMHXXHPLTBQPFBJWQDBYGPNZTPFZJGSDDTQSHZEAWZZYLLTYYBWJKXXGHLFKXDJTMSZSQYNZGGSWQSPHTLSSKMCLZXYSZQZXNCJDQGZDLFNYKLJCJLLZLMZZNHYDSSHTHZZLZZBBHQZWWYCRZHLYQQJBEYFXXXWHSRXWQHWPSLMSSKZTTYGYQQWRSLALHMJTQJSMXQBJJZJXZYZKXBYQXBJXSHZTSFJLXMXZXFGHKZSZGGYLCLSARJYHSLLLMZXELGLXYDJYTLFBHBPNLYZFBBHPTGJKWETZHKJJXZXXGLLJLSTGSHJJYQLQZFKCGNNDJSSZFDBCTWWSEQFHQJBSAQTGYPQLBXBMMYWXGSLZHGLZGQYFLZBYFZJFRYSFMBYZHQGFWZSYFYJJPHZBYYZFFWODGRLMFTWLBZGYCQXCDJYGZYYYYTYTYDWEGAZYHXJLZYYHLRMGRXXZCLHNELJJTJTPWJYBJJBXJJTJTEEKHWSLJPLPSFYZPQQBDLQJJTYYQLYZKDKSQJYYQZLDQTGJQYZJSUCMRYQTHTEJMFCTYHYPKMHYZWJDQFHYYXWSHCTXRLJHQXHCCYYYJLTKTTYTMXGTCJTZAYYOCZLYLBSZYWJYTSJYHBYSHFJLYGJXXTMZYYLTXXYPZLXYJZYZYYPNHMYMDYYLBLHLSYYQQLLNJJYMSOYQBZGDLYXYLCQYXTSZEGXHZGLHWBLJHEYXTWQMAKBPQCGYSHHEGQCMWYYWLJYJHYYZLLJJYLHZYHMGSLJLJXCJJYCLYCJPCPZJZJMMYLCQLNQLJQJSXYJMLSZLJQLYCMMHCFMMFPQQMFYLQMCFFQMMMMHMZNFHHJGTTHHKHSLNCHHYQDXTMMQDCYZYXYQMYQYLTDCYYYZAZZCYMZYDLZFFFMMYCQZWZZMABTBYZTDMNZZGGDFTYPCGQYTTSSFFWFDTZQSSYSTWXJHXYTSXXYLBYQHWWKXHZXWZNNZZJZJJQJCCCHYYXBZXZCYZTLLCQXYNJYCYYCYNZZQYYYEWYCZDCJYCCHYJLBTZYYCQWMPWPYMLGKDLDLGKQQBGYCHJXY";
  //此处收录了375个多音字  
  var oMultiDiff = { "19969": "DZ", "19975": "WM", "19988": "QJ", "20048": "YL", "20056": "SC", "20060": "NM", "20094": "QG", "20127": "QJ", "20167": "QC", "20193": "YG", "20250": "KH", "20256": "ZC", "20282": "SC", "20285": "QJG", "20291": "TD", "20314": "YD", "20340": "NE", "20375": "TD", "20389": "YJ", "20391": "CZ", "20415": "PB", "20446": "YS", "20447": "SQ", "20504": "TC", "20608": "KG", "20854": "QJ", "20857": "ZC", "20911": "PF", "20985": "AW", "21032": "PB", "21048": "XQ", "21049": "SC", "21089": "YS", "21119": "JC", "21242": "SB", "21273": "SC", "21305": "YP", "21306": "QO", "21330": "ZC", "21333": "SDC", "21345": "QK", "21378": "CA", "21397": "SC", "21414": "XS", "21442": "SC", "21477": "JG", "21480": "TD", "21484": "ZS", "21494": "YX", "21505": "YX", "21512": "HG", "21523": "XH", "21537": "PB", "21542": "PF", "21549": "KH", "21571": "E", "21574": "DA", "21588": "TD", "21589": "O", "21618": "ZC", "21621": "KHA", "21632": "ZJ", "21654": "KG", "21679": "LKG", "21683": "KH", "21710": "A", "21719": "YH", "21734": "WOE", "21769": "A", "21780": "WN", "21804": "XH", "21834": "A", "21899": "ZD", "21903": "RN", "21908": "WO", "21939": "ZC", "21956": "SA", "21964": "YA", "21970": "TD", "22003": "A", "22031": "JG", "22040": "XS", "22060": "ZC", "22066": "ZC", "22079": "MH", "22129": "XJ", "22179": "XA", "22237": "NJ", "22244": "TD", "22280": "JQ", "22300": "YH", "22313": "XW", "22331": "YQ", "22343": "YJ", "22351": "PH", "22395": "DC", "22412": "TD", "22484": "PB", "22500": "PB", "22534": "ZD", "22549": "DH", "22561": "PB", "22612": "TD", "22771": "KQ", "22831": "HB", "22841": "JG", "22855": "QJ", "22865": "XQ", "23013": "ML", "23081": "WM", "23487": "SX", "23558": "QJ", "23561": "YW", "23586": "YW", "23614": "YW", "23615": "SN", "23631": "PB", "23646": "ZS", "23663": "ZT", "23673": "YG", "23762": "TD", "23769": "ZS", "23780": "QJ", "23884": "QK", "24055": "XH", "24113": "DC", "24162": "ZC", "24191": "GA", "24273": "QJ", "24324": "NL", "24377": "TD", "24378": "QJ", "24439": "PF", "24554": "ZS", "24683": "TD", "24694": "WE", "24733": "LK", "24925": "TN", "25094": "ZG", "25100": "XQ", "25103": "XH", "25153": "PB", "25170": "PB", "25179": "KG", "25203": "PB", "25240": "ZS", "25282": "FB", "25303": "NA", "25324": "KG", "25341": "ZY", "25373": "WZ", "25375": "XJ", "25384": "A", "25457": "A", "25528": "SD", "25530": "SC", "25552": "TD", "25774": "ZC", "25874": "ZC", "26044": "YW", "26080": "WM", "26292": "PB", "26333": "PB", "26355": "ZY", "26366": "CZ", "26397": "ZC", "26399": "QJ", "26415": "ZS", "26451": "SB", "26526": "ZC", "26552": "JG", "26561": "TD", "26588": "JG", "26597": "CZ", "26629": "ZS", "26638": "YL", "26646": "XQ", "26653": "KG", "26657": "XJ", "26727": "HG", "26894": "ZC", "26937": "ZS", "26946": "ZC", "26999": "KJ", "27099": "KJ", "27449": "YQ", "27481": "XS", "27542": "ZS", "27663": "ZS", "27748": "TS", "27784": "SC", "27788": "ZD", "27795": "TD", "27812": "O", "27850": "PB", "27852": "MB", "27895": "SL", "27898": "PL", "27973": "QJ", "27981": "KH", "27986": "HX", "27994": "XJ", "28044": "YC", "28065": "WG", "28177": "SM", "28267": "QJ", "28291": "KH", "28337": "ZQ", "28463": "TL", "28548": "DC", "28601": "TD", "28689": "PB", "28805": "JG", "28820": "QG", "28846": "PB", "28952": "TD", "28975": "ZC", "29100": "A", "29325": "QJ", "29575": "SL", "29602": "FB", "30010": "TD", "30044": "CX", "30058": "PF", "30091": "YSP", "30111": "YN", "30229": "XJ", "30427": "SC", "30465": "SX", "30631": "YQ", "30655": "QJ", "30684": "QJG", "30707": "SD", "30729": "XH", "30796": "LG", "30917": "PB", "31074": "NM", "31085": "JZ", "31109": "SC", "31181": "ZC", "31192": "MLB", "31293": "JQ", "31400": "YX", "31584": "YJ", "31896": "ZN", "31909": "ZY", "31995": "XJ", "32321": "PF", "32327": "ZY", "32418": "HG", "32420": "XQ", "32421": "HG", "32438": "LG", "32473": "GJ", "32488": "TD", "32521": "QJ", "32527": "PB", "32562": "ZSQ", "32564": "JZ", "32735": "ZD", "32793": "PB", "33071": "PF", "33098": "XL", "33100": "YA", "33152": "PB", "33261": "CX", "33324": "BP", "33333": "TD", "33406": "YA", "33426": "WM", "33432": "PB", "33445": "JG", "33486": "ZN", "33493": "TS", "33507": "QJ", "33540": "QJ", "33544": "ZC", "33564": "XQ", "33617": "YT", "33632": "QJ", "33636": "XH", "33637": "YX", "33694": "WG", "33705": "PF", "33728": "YW", "33882": "SR", "34067": "WM", "34074": "YW", "34121": "QJ", "34255": "ZC", "34259": "XL", "34425": "JH", "34430": "XH", "34485": "KH", "34503": "YS", "34532": "HG", "34552": "XS", "34558": "YE", "34593": "ZL", "34660": "YQ", "34892": "XH", "34928": "SC", "34999": "QJ", "35048": "PB", "35059": "SC", "35098": "ZC", "35203": "TQ", "35265": "JX", "35299": "JX", "35782": "SZ", "35828": "YS", "35830": "E", "35843": "TD", "35895": "YG", "35977": "MH", "36158": "JG", "36228": "QJ", "36426": "XQ", "36466": "DC", "36710": "JC", "36711": "ZYG", "36767": "PB", "36866": "SK", "36951": "YW", "37034": "YX", "37063": "XH", "37218": "ZC", "37325": "ZC", "38063": "PB", "38079": "TD", "38085": "QY", "38107": "DC", "38116": "TD", "38123": "YD", "38224": "HG", "38241": "XTC", "38271": "ZC", "38415": "YE", "38426": "KH", "38461": "YD", "38463": "AE", "38466": "PB", "38477": "XJ", "38518": "YT", "38551": "WK", "38585": "ZC", "38704": "XS", "38739": "LJ", "38761": "GJ", "38808": "SQ", "39048": "JG", "39049": "XJ", "39052": "HG", "39076": "CZ", "39271": "XT", "39534": "TD", "39552": "TD", "39584": "PB", "39647": "SB", "39730": "LG", "39748": "TPB", "40109": "ZQ", "40479": "ND", "40516": "HG", "40536": "HG", "40583": "QJ", "40765": "YQ", "40784": "QJ", "40840": "YK", "40863": "QJG" };
  //参数,中文字符串  
  //返回值:拼音首字母串数组  
  function makePy(str) {
    if (typeof (str) !== "string") alert("函数makePy需要字符串类型参数!");
    // throw new Error(-1,"函数makePy需要字符串类型参数!");  
    var arrResult = new Array(); //保存中间结果的数组  
    for (var i = 0, len = str.length; i < len; i++) {
      //获得unicode码  
      var ch = str.charAt(i);
      //检查该unicode码是否在处理范围之内,在则返回该码对映汉字的拼音首字母,不在则调用其它函数处理  
      arrResult.push(checkCh(ch));
    }
    //处理arrResult,返回所有可能的拼音首字母串数组  
    return mkRslt(arrResult);

  }
  function checkCh(ch) {
    var uni = ch.charCodeAt(0);
    //如果不在汉字处理范围之内,返回原字符,也可以调用自己的处理函数  
    if (uni > 40869 || uni < 19968)
      return ch; //dealWithOthers(ch);  
    //检查是否是多音字,是按多音字处理,不是就直接在strChineseFirstPY字符串中找对应的首字母  
    return (oMultiDiff[uni] ? oMultiDiff[uni] : (strChineseFirstPY.charAt(uni - 19968)));
  }
  function mkRslt(arr) {
    var arrRslt = [""];
    for (var i = 0, len = arr.length; i < len; i++) {
      var str = arr[i];
      var strlen = str.length;
      if (strlen == 1) {
        for (var k = 0; k < arrRslt.length; k++) {
          arrRslt[k] += str;
        }
      } else {
        var tmpArr = arrRslt.slice(0);
        arrRslt = [];
        for (k = 0; k < strlen; k++) {
          //复制一个相同的arrRslt  
          var tmp = tmpArr.slice(0);
          //把当前字符str[k]添加到每个元素末尾  
          for (var j = 0; j < tmp.length; j++) {
            tmp[j] += str.charAt(k);
          }
          //把复制并修改后的数组连接到arrRslt上  
          arrRslt = arrRslt.concat(tmp);
        }
      }
    }
    return arrRslt;
  }
  //两端去空格函数  
  String.prototype.trim = function () { return this.replace(/(^\s*)|(\s*$)/g, ""); }

  if (city) {
    var arrRslt = makePy(city);
    return arrRslt[0]
  } else {
    // console.log('city不存在')
  }

}

export default Creator;
