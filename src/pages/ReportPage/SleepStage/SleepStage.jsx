import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography } from 'antd';
import { withTranslation } from 'react-i18next';
import './SleepStage.scss';

const { Title } = Typography;


class SleepStage extends Component {

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

    const remSleepPer = parseFloat((remSleep * 100 / all).toFixed(1));
    const lightSleepPer = parseFloat((lightSleep * 100 / all).toFixed(1));
    const deepSleepPer = parseFloat((deepSleep * 100 / all).toFixed(1));
    const wakeTimePer = parseFloat((wakeTime * 100 / all).toFixed(1));

    return {
      wakeTime,
      wakeTimePer,
      remSleep,
      remSleepPer,
      lightSleep,
      lightSleepPer,
      deepSleep,
      deepSleepPer
    };
  }

  render() {
    const { t } = this.props;

    return (
      <div className="block">
        <Title level={2}>{t('Sleep Stage Statistics')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data stage-table">
          <span>
            <span>{t('Sleep Stage')}</span>
            <span>{t('Sleep Stage Duration')}</span>
            <span>{t('Total proportion (%)')}</span>
          </span>
          <span>
            <span>{t('Awake')}</span>
            <span className="table-value">{ this.getSleepPercent().wakeTime }</span>
            <span className="table-value">{ this.getSleepPercent().wakeTimePer }</span>
          </span>
          <span>
            <span>{t('REM')}</span>
            <span className="table-value">{ this.getSleepPercent().remSleep }</span>
            <span className="table-value">{ this.getSleepPercent().remSleepPer }</span>
          </span>
          <span>
            <span>{t('Light')}</span>
            <span className="table-value">{ this.getSleepPercent().lightSleep }</span>
            <span className="table-value">{ this.getSleepPercent().lightSleepPer }</span>
          </span>
          <span>
            <span>{t('Deep')}</span>
            <span className="table-value">{ this.getSleepPercent().deepSleep }</span>
            <span className="table-value">{ this.getSleepPercent().deepSleepPer }</span>
          </span>
        </div>
      </div>
    );
  }
}

SleepStage.propTypes = {
  sleepData: PropTypes.array.isRequired,
};

const mapStateToProps = state => (
  {
    sleepData: state.report.data.sleepData,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SleepStage));
