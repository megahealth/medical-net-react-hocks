import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
// import Creator from '../../../actions/Creator';

class StagePieChart extends Component {
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

  getOption = () => {
    const {
      wakeTime,
      wakeTimePer,
      remSleep,
      remSleepPer,
      lightSleep,
      lightSleepPer,
      deepSleep,
      deepSleepPer
    } = this.getSleepPercent();

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
          fontSize: 16
        },
        formatter(name) {
          switch (name) {
            case '清醒期':
              return `清醒期：${wakeTime}分钟(${wakeTimePer}%)`;
            case '眼动期':
              return `眼动期：${remSleep}分钟(${remSleepPer}%)`;
            case '浅睡期':
              return `浅睡期：${lightSleep}分钟(${lightSleepPer}%)`;
            case '深睡期':
              return `深睡期：${deepSleep}分钟(${deepSleepPer}%)`;
            default:
              break;
          }
        },
        data: [
          '清醒期',
          '眼动期',
          '浅睡期',
          '深睡期'
        ]
      },
      tooltip: {
        trigger: 'item'
      },
      series: [{
        name: '睡眠分期',
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
          name: '清醒期',
          itemStyle: {
            normal: {
              color: '#cff09e'
            }
          }
        },
        {
          value: lightSleep,
          name: '浅睡期',
          itemStyle: {
            normal: {
              color: '#a8dba8'
            }
          }
        },
        {
          value: deepSleep,
          name: '深睡期',
          itemStyle: {
            normal: {
              color: '#3b8686'
            }
          }
        },
        {
          value: remSleep,
          name: '眼动期',
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
      <div className="block">
        <ReactEcharts option={this.getOption()} style={{ height: '200px' }} />
      </div>
    );
  }
}

StagePieChart.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(StagePieChart);
