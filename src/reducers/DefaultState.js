const DefaultState = {
  // 首页数据
  home: {
    loading: false,
    error: false,
    animation: false,
  },
  allReports: {
    loading: false,
    error: false,
    reportsData: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    dateRange: {
      startDate: new Date(),
      endDate: new Date()
    },
    filter: {
      reportType: ['all'],
      startDate: null,
      endDate: null
    }
  },
  report: {
    loading: true,
    error: false,
    data: {
      SPOVER: 'NONE',
      remoteDevice: {
        breathRate: 0,
        deviceSN: '',
        modeType: 0,
        romVersion: '2.1.1',
        setTimezone: 800, // 时区
        versionNO: '2.4.7730'
      },
      boundDevices: [
        {
          hwVersion: '3.0',
          btVersion: '2.8',
          swVersion: '2.0.7622',
          powerStatus: -1,
          type: 0,
          battery: -1,
          connectStatus: 0,
          monitor: -1,
          deviceType: 'MegaRing',
          sn: 'P11D71901000241',
          mac: 'BC:E5:9F:48:8A:02'
        }
      ],
      patientInfo: [],
      idModifiledReport: null,
      advice: '',
      AHI: 0,
      eventCnt: 0,
      sleepData: [],
      breathList: [],
      startSleepTime: 0,
      startStatusTimeMinute: 0,
      endStatusTimeMinute: 0,
      extraCheckTimeMinute: 0,
      ringData: '',
      ringOriginalData: '',
      snoreList: [],
      noiseList: [],
      somniloquyList: [],
      bodyMoveListInfo: {},
      bodyMoveList: [],
      startSnoreTime: 0,
      endSnoreDuration: 0,
      waveFileId: '',
    },
    alreadyDecodedData: {
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
    },
    waveData: {}
  }
};

export default DefaultState;
