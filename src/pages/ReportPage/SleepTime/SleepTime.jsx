/* eslint-disable no-plusplus */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Typography } from 'antd';
import { withTranslation } from 'react-i18next';

const { Title } = Typography;

class SleepTime extends Component {

  getSleepPercent() {
    const { sleepData, t } = this.props;
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
      totalSleepTime: `${totalSleepMilliseconds.hours()} ${t('Hour')} ${totalSleepMilliseconds.minutes()} ${t('Minute')}`,
      sleepPercent: 100 - wakeTimePer,
    };
  }

  getSleepTime() {
    const { startSleepTime, startStatusTimeMinute, endStatusTimeMinute, extraCheckTimeMinute, t } = this.props;
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
      totalRecordTime: `${totalMilliseconds.hours()} ${t('Hour')} ${totalMilliseconds.minutes()} ${t('Minute')}`,
      totalSleepTime: this.getSleepPercent().totalSleepTime,
      sleepPercent: this.getSleepPercent().sleepPercent,
    };
  }

  render() {
    const { t } = this.props;

    return (
      <div className="block">
        <Title level={2}>{t('Sleep Time Statistics')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>{ this.getSleepTime().sleepStageStart }</span>
            <span>{t('Recording Start Time')}</span>
          </span>
          <span>
            <span>{ this.getSleepTime().sleepStageEnd }</span>
            <span>{t('Recording End Time')}</span>
          </span>
          <span>
            <span>{ this.getSleepTime().totalRecordTime }</span>
            <span>{t('Total Tecord Duration')}</span>
          </span>
          <span>
            <span>{ this.getSleepTime().totalSleepTime }</span>
            <span>{t('Total Sleep Duration')}</span>
          </span>
          <span>
            <span>{ this.getSleepTime().sleepPercent }</span>
            <span>{t('Sleep Efficiency')}(%)</span>
          </span>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SleepTime));
