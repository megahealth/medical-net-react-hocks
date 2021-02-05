import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Typography } from 'antd';
import { withTranslation } from 'react-i18next';
import './RespiratoryEvents.scss';

const { Title } = Typography;


class RespiratoryEvents extends Component {

  countRespiratoryEvents() {
    const { startSleepTime, startStatusTimeMinute, endStatusTimeMinute, breathList, BEMeanlen, BETotalrate } = this.props;
    const sleepStageStart = startSleepTime + (startStatusTimeMinute === -1 ? 0 : startStatusTimeMinute) * 60 * 1000;
    const hasBreathType = breathList.length > 0 && breathList[0].length > 4;
    let max = 0;
    let maxDuration = 0;
    let total = 0;
    // t0:混合性 t1：中枢性 t2：阻塞性 t3：低通气
    const breathTypeEnt = {
      t0: 0,
      t1: 0,
      t2: 0,
      t3: 0
    };
    if (breathList.length != 0) {
      for (let i = 0; i < breathList.length; i++) {
        const thisValue = breathList[i][1];
        if (max < thisValue) {
          max = thisValue;
          maxDuration = breathList[i][0];
        }
        total += thisValue;
        if (hasBreathType) {
          switch (breathList[i][4]) {
            case 0:
              breathTypeEnt.t0++;
              break;
            case 1:
              breathTypeEnt.t1++;
              break;
            case 2:
              breathTypeEnt.t2++;
              break;
            case 3:
              breathTypeEnt.t3++;
              break;
            default:
              return;
          }
        }
      }
    }
    return {
      BEMeanlen: breathList.length!=0?parseInt((total / breathList.length).toFixed(0), 10):BEMeanlen,
      BEMaxlen: max,
      BEMaxlentime: (startSleepTime + maxDuration * 1000),
      BEOHCnt: breathTypeEnt.t2 + breathTypeEnt.t3,
      BECCnt: breathTypeEnt.t1,
      BEMCnt: breathTypeEnt.t0,
      BECnt: breathList.length,
      BETotalTime: parseInt((total / 60).toFixed(0), 10),
      BETotalrate: total!=0?parseFloat((total / 60 / (endStatusTimeMinute - startStatusTimeMinute) * 100).toFixed(1), 10):BETotalrate,
    };
  }

  render() {
    const { BECCnt, BECnt, BEMCnt, BEMaxlen, BEMaxlentime, BEMeanlen, BEOHCnt, BETotalTime, BETotalrate, SPOVER, t } = this.props;
    const events = {};
    if (SPOVER === 'NONE') {
      // console.log(this.countRespiratoryEvents());
      events.BEMeanlen = this.countRespiratoryEvents().BEMeanlen;
      events.BEMaxlen = this.countRespiratoryEvents().BEMaxlen;
      events.BEMaxlentime = this.countRespiratoryEvents().BEMaxlentime;
      events.BEOHCnt = this.countRespiratoryEvents().BEOHCnt;
      events.BECCnt = this.countRespiratoryEvents().BECCnt;
      events.BEMCnt = this.countRespiratoryEvents().BEMCnt;
      events.BECnt = this.countRespiratoryEvents().BECnt;
      events.BETotalTime = this.countRespiratoryEvents().BETotalTime;
      events.BETotalrate = parseFloat(this.countRespiratoryEvents().BETotalrate).toFixed(1);
    } else {
      events.BEMeanlen = BEMeanlen;
      events.BEMaxlen = BEMaxlen;
      events.BEMaxlentime = BEMaxlentime;
      events.BEOHCnt = BEOHCnt;
      events.BECCnt = BECCnt;
      events.BEMCnt = BEMCnt;
      events.BECnt = BECnt;
      events.BETotalTime = BETotalTime;
      events.BETotalrate = parseFloat(BETotalrate).toFixed(1);
    }
    return (
      <div className="block">
        <Title level={2}>{t('Sleep Respiratory Event')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data table-event">
          <span>
            <span>{ events.BEMeanlen }</span>
            <span>{t('BEMeanlen')}</span>
            <span>{ events.BECnt }</span>
            <span>{t('BECnt')}</span>
            <span>{ events.BEOHCnt }</span>
            <span>{t('BEOHCnt')}</span>
          </span>
          <span>
            <span>{ events.BEMaxlen }</span>
            <span>{t('BEMaxlen')}</span>
            <span>{ events.BETotalTime }</span>
            <span>{t('BETotalTime')}</span>
            <span>{ events.BECCnt }</span>
            <span>{t('BECCnt')}</span>
          </span>
          <span>
            <span>{ moment(events.BEMaxlentime).format("HH:mm") }</span>
            <span>{t('BEMaxlentime')}</span>
            <span>{ events.BETotalrate }</span>
            <span>{t('BETotalrate')}</span>
            <span>{ events.BEMCnt }</span>
            <span>{t('BEMCnt')}</span>
          </span>
        </div>
      </div>
    );
  }
}

RespiratoryEvents.propTypes = {
  BECCnt: PropTypes.number.isRequired,
  BECnt: PropTypes.number.isRequired,
  BEMCnt: PropTypes.number.isRequired,
  BEMaxlen: PropTypes.number.isRequired,
  BEMaxlentime: PropTypes.number.isRequired,
  BEMeanlen: PropTypes.number.isRequired,
  BEOHCnt: PropTypes.number.isRequired,
  BETotalTime: PropTypes.number.isRequired,
  BETotalrate: PropTypes.number.isRequired,
  SPOVER: PropTypes.string.isRequired,
  startSleepTime: PropTypes.number.isRequired,
  startStatusTimeMinute: PropTypes.number.isRequired,
  endStatusTimeMinute: PropTypes.number.isRequired,
  breathList: PropTypes.array.isRequired,
};

const mapStateToProps = state => (
  {
    BECCnt: state.report.alreadyDecodedData.BECCnt,
    BECnt: state.report.alreadyDecodedData.BECnt,
    BEMCnt: state.report.alreadyDecodedData.BEMCnt,
    BEMaxlen: state.report.alreadyDecodedData.BEMaxlen,
    BEMaxlentime: state.report.alreadyDecodedData.BEMaxlentime,
    BEMeanlen: state.report.alreadyDecodedData.BEMeanlen,
    BEOHCnt: state.report.alreadyDecodedData.BEOHCnt,
    BETotalTime: state.report.alreadyDecodedData.BETotalTime,
    BETotalrate: state.report.alreadyDecodedData.BETotalrate,
    SPOVER: state.report.data.SPOVER,
    startSleepTime: state.report.data.startSleepTime,
    startStatusTimeMinute: state.report.data.startStatusTimeMinute,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
    breathList: state.report.data.breathList,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(RespiratoryEvents));
