import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
import { withTranslation } from 'react-i18next';

class StagePieChart extends Component {

  getOption = () => {
    const { t,adviceData } = this.props;
    const {
      wakeTime,
      wakeTimePer,
      remSleep,
      remSleepPercent,
      lightSleep,
      lightSleepPercent,
      deepSleep,
      deepSleepPercent
    } = adviceData;

    const option = {
      grid: {
        left: '0%',
        right: '0%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      legend: {
        orient: 'vertical',
        // x: 'legend_x',
        right: '20%',
        y: 'center',
        selectedMode: false,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#333',
          fontSize: 12
        },
        formatter(name) {
          switch (name) {
            case '清醒期':
              return `清醒期：${wakeTime}分钟(${wakeTimePer}%)`;
            case '眼动期':
              return `眼动期：${remSleep}分钟(${remSleepPercent}%)`;
            case '浅睡期':
              return `浅睡期：${lightSleep}分钟(${lightSleepPercent}%)`;
            case '深睡期':
              return `深睡期：${deepSleep}分钟(${deepSleepPercent}%)`;
            case 'Awake':
              return `Awake: ${wakeTime} min (${wakeTimePer}%)`;
            case 'REM':
              return `REM: ${remSleep} min (${remSleepPercent}%)`;
            case 'Light':
              return `Light: ${lightSleep} min (${lightSleepPercent}%)`;
            case 'Deep':
              return `Deep: ${deepSleep} min (${deepSleepPercent}%)`;
            default:
              break;
          }
        },
        data: [
          t('Awake'),
          t('REM'),
          t('Light'),
          t('Deep')
        ]
      },
      tooltip: {
        trigger: 'item'
      },
      series: [{
        name: t('Sleep Stage'),
        type: 'pie',
        center: ['30%', '50%'],
        radius: [0, '75%'],
        itemStyle: {
          normal: {
            label: {
              show: false
            },
            labelLine: {
              show: false
            }
          }
        },
        data: [{
          value: wakeTime,
          name: t('Awake'),
          itemStyle: {
            normal: {
              color: '#cff09e'
            }
          }
        },
        {
          value: lightSleep,
          name: t('Light'),
          itemStyle: {
            normal: {
              color: '#a8dba8'
            }
          }
        },
        {
          value: deepSleep,
          name: t('Deep'),
          itemStyle: {
            normal: {
              color: '#3b8686'
            }
          }
        },
        {
          value: remSleep,
          name: t('REM'),
          itemStyle: {
            normal: {
              color: '#79bd9a'
            }
          }
        }
        ]
      }]
    };
    return option;
  }

  render() {
    return (
      <div className="block print-echart-resize">
        <ReactEcharts className='stage-pie' option={this.getOption()} style={{ height: '2rem' }} />
      </div>
    );
  }
}

StagePieChart.propTypes = {
  sleepData: PropTypes.array.isRequired,
  adviceData: PropTypes.object.isRequired,
};

const mapStateToProps = state => (
  {
    sleepData: state.report.data.sleepData,
    adviceData: state.report.adviceData,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StagePieChart));
