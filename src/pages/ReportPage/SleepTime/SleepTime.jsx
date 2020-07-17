/* eslint-disable no-plusplus */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Typography, Tooltip } from 'antd';
// import Creator from '../../../actions/Creator';

const { Title } = Typography;

class SleepTime extends Component {

  componentDidMount() {

  }

  getSleepPercent() {
    const { sleepData } = this.props;
    let wakeTime = 0;
    let remSleep = 0;
    let lightSleep = 0;
    let deepSleep = 0;
    let all = 0;
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

    const wakeTimePer = parseFloat((wakeTime * 100 / all).toFixed(1));
    const totalSleepMilliseconds = moment.duration((lightSleep + remSleep + deepSleep) * 60 * 1000);

    return {
      totalSleepTime: `${totalSleepMilliseconds.hours()}时${totalSleepMilliseconds.minutes()}分`,
      sleepPercent: 100 - wakeTimePer,
    };
  }

  getSleepTime() {
    const { startSleepTime, startStatusTimeMinute, endStatusTimeMinute, extraCheckTimeMinute } = this.props;
    const start = startSleepTime;
    const sleepStageStart = start + (startStatusTimeMinute === -1 ? 0 : startStatusTimeMinute) * 60 * 1000;
    const sleepStageEnd = start + (endStatusTimeMinute === -1 ? 0 : endStatusTimeMinute) * 60 * 1000;
    const end = start + (extraCheckTimeMinute === -1 ? 0 : extraCheckTimeMinute) * 60 * 1000;
    const totalMilliseconds = moment.duration(sleepStageEnd - sleepStageStart);

    return {
      start: moment(start).format('HH:mm'),
      end: moment(end).format('HH:mm'),
      sleepStageStart: moment(sleepStageStart).format('HH:mm'),
      sleepStageEnd: moment(sleepStageEnd).format('HH:mm'),
      totalRecordTime: `${totalMilliseconds.hours()}时${totalMilliseconds.minutes()}分`,
      totalSleepTime: this.getSleepPercent().totalSleepTime,
      sleepPercent: this.getSleepPercent().sleepPercent,
    };
  }

  render() {
    return (
      <div className="block">
        <Title level={2}>睡眠时间统计</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <Tooltip title="设备监测到用户并开始记录监测数据">
            <span>{ this.getSleepTime().sleepStageStart }</span>
            <span>记录开始时间</span>
          </Tooltip>
          <Tooltip title="设备停止记录监测数据">
            <span>{ this.getSleepTime().sleepStageEnd }</span>
            <span>记录结束时间</span>
          </Tooltip>
          <Tooltip title="设备监测总时长">
            <span>{ this.getSleepTime().totalRecordTime }</span>
            <span>总记录时间</span>
          </Tooltip>
          <Tooltip title="监测到用户入睡总时长">
            <span>{ this.getSleepTime().totalSleepTime }</span>
            <span>总睡眠时间</span>
          </Tooltip>
          <Tooltip title="浅睡期眼动期和深睡期占总睡眠时长的比例">
            <span>{ this.getSleepTime().sleepPercent }</span>
            <span>睡眠效率(%)</span>
          </Tooltip>
        </div>
      </div>
    );
  }
}

SleepTime.propTypes = {
  startSleepTime: PropTypes.number.isRequired,
  startStatusTimeMinute: PropTypes.number.isRequired,
  endStatusTimeMinute: PropTypes.number.isRequired,
  extraCheckTimeMinute: PropTypes.number.isRequired,
  sleepData: PropTypes.array.isRequired,
};

const mapStateToProps = state => (
  {
    startSleepTime: state.report.data.startSleepTime,
    startStatusTimeMinute: state.report.data.startStatusTimeMinute,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
    extraCheckTimeMinute: state.report.data.extraCheckTimeMinute,
    sleepData: state.report.data.sleepData,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(SleepTime);
