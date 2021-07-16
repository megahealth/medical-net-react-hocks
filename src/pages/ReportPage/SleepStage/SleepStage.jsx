import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography, Input } from 'antd';
import { withTranslation } from 'react-i18next';
import Creator from '../../../actions/Creator';
import './SleepStage.scss';

const { Title } = Typography;


class SleepStage extends Component {

  // getSleepPercent() {
  //   const { sleepData } = this.props;
  //   let wakeTime = 0;
  //   let remSleep = 0;
  //   let lightSleep = 0;
  //   let deepSleep = 0;
  //   let all = 0;
  //   for (let i = 0, j = sleepData.length; i < j; i++) {
  //     all++;
  //     switch (sleepData[i]) {
  //       case 0:
  //         wakeTime++;
  //         break;
  //       case 2:
  //         remSleep++;
  //         break;
  //       case 3:
  //         lightSleep++;
  //         break;
  //       case 4:
  //         deepSleep++;
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  //   console.log(wakeTime,remSleep,lightSleep,deepSleep)
  //   const remSleepPer = parseFloat((remSleep * 100 / all).toFixed(1)) || '--';
  //   const lightSleepPer = parseFloat((lightSleep * 100 / all).toFixed(1)) || '--';
  //   const deepSleepPer = parseFloat((deepSleep * 100 / all).toFixed(1)) || '--';
  //   const wakeTimePer = parseFloat((wakeTime * 100 / all).toFixed(1)) || '--';

  //   return {
  //     wakeTime,
  //     wakeTimePer,
  //     remSleep,
  //     remSleepPer,
  //     lightSleep,
  //     lightSleepPer,
  //     deepSleep,
  //     deepSleepPer
  //   };
  // }

  handleChange = (e) => {
    const { handleInputChange } = this.props;
    var data = {[e.target.name]:e.target.value};
    handleInputChange({
      ...data,
    })
  }

  render() {
    const { t,adviceData,isEditting } = this.props;
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
            <span>{t('Sleep Stage Percent')}</span>
          </span>
          <span>
            <span>{t('Awake')}</span>
            <span className="table-value">
              { isEditting?
                <Input 
                  type="string" 
                  name="wakeTime"
                  value={ adviceData.wakeTime }
                  onChange={ this.handleChange }
                />:adviceData.wakeTime 
              }
            </span>
            <span className="table-value">
              { isEditting?
                <Input 
                  type="string" 
                  name="wakeTimePer"
                  value={ adviceData.wakeTimePer }
                  onChange={ this.handleChange }
                />:adviceData.wakeTimePer 
              }
            </span>
          </span>
          <span>
            <span>{t('REM')}</span>
            <span className="table-value">
              { isEditting?
                <Input 
                  type="string" 
                  name="remSleep"
                  value={ adviceData.remSleep }
                  onChange={ this.handleChange }
                />:adviceData.remSleep 
              }
            </span>
            <span className="table-value">
              { isEditting?
                <Input 
                  type="string" 
                  name="remSleepPercent"
                  value={ adviceData.remSleepPercent }
                  onChange={ this.handleChange }
                />:adviceData.remSleepPercent 
              }
            </span>
          </span>
          <span>
            <span>{t('Light')}</span>
            <span className="table-value">
              { isEditting?
                <Input 
                  type="string" 
                  name="lightSleep"
                  value={ adviceData.lightSleep }
                  onChange={ this.handleChange }
                />:adviceData.lightSleep 
              }
            </span>
            <span className="table-value">
              { isEditting?
                <Input 
                  type="string" 
                  name="lightSleepPercent"
                  value={ adviceData.lightSleepPercent }
                  onChange={ this.handleChange }
                />:adviceData.lightSleepPercent 
              }
            </span>
          </span>
          <span>
            <span>{t('Deep')}</span>
            <span className="table-value">
              { isEditting?
                <Input 
                  type="string" 
                  name="deepSleep"
                  value={ adviceData.deepSleep }
                  onChange={ this.handleChange }
                />:adviceData.deepSleep 
              }
            </span>
            <span className="table-value">
              { isEditting?
                <Input 
                  type="string" 
                  name="deepSleepPercent"
                  value={ adviceData.deepSleepPercent }
                  onChange={ this.handleChange }
                />:adviceData.deepSleepPercent 
              }
            </span>
          </span>
        </div>
      </div>
    );
  }
}

SleepStage.propTypes = {
  sleepData: PropTypes.array.isRequired,
  adviceData: PropTypes.object.isRequired,
  isEditting: PropTypes.bool,
};

const mapStateToProps = state => (
  {
    sleepData: state.report.data.sleepData,
    adviceData: state.report.adviceData,
    isEditting: state.report.isEditting,
  }
);

const mapDispatchToProps = dispatch => (
  {
    handleInputChange(data){
      dispatch(Creator.handleInputChange(data,{}))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SleepStage));
