import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
import { withTranslation } from 'react-i18next';

class StageChart extends Component {

  getOption = () => {
    const {
      startSleepTime,
      startStatusTimeMinute,
      endStatusTimeMinute,
      sleepData,
      t
    } = this.props;
    const sleepStageStart = startSleepTime + startStatusTimeMinute * 60 * 1000;
    const sleepStageEnd = startSleepTime + endStatusTimeMinute * 60 * 1000;

    const data = [];

    for (let i = 1, j = sleepData.length; i < j; i++) {
      if (sleepData[i] !== 6 && sleepData[i - 1] === 6 && sleepData[i + 1] === 6 && i < (j - 1)) {
        sleepData[i] = 6;
      }
      if (sleepData[i] === 6 && sleepData[i - 1] !== 6 && sleepData[i + 1] !== 6 && i < (j - 1)) {
        sleepData[i] = sleepData[i - 1];
      }
      let sleepDataResult = sleepData[i - 1] === 0 ? 4 : (5 - sleepData[i - 1]);
      if (sleepDataResult === -1) {
        sleepDataResult = 4;
      }
      const bt = new Date(sleepStageStart);
      const nt = new Date(bt);
      nt.setMinutes((bt.getMinutes() + i), 0, 0);
      data.push([nt, sleepDataResult]);
    }

    const option = {
      animation: false,
      grid: {
        left: '-1%',
        right: '3%',
        bottom: '8%',
        top: '20%',
        containLabel: true,
      },
      // dataZoom: [{
      //   type: 'inside',
      //   start: 0,
      //   end: 100
      // }, {}],
      visualMap: {
        show: false,
        top: 10,
        right: 10,
        pieces: [{
          gt: 0,
          lte: 1,
          color: '#3b8686'
        }, {
          gt: 1,
          lte: 2,
          color: '#79bd9a'
        }, {
          gt: 2,
          lte: 3,
          color: '#a8dba8'
        }, {
          gt: 3,
          lte: 4,
          color: '#cff09e'
        }],
        outOfRange: {
          color: '#cff09e'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let str = '';
          switch (params[0].value[1]) {
            case 1:
              str = t('Deep');
              break;
            case 2:
              str = t('Light');
              break;
            case 3:
              str = t('REM');
              break;
            case 4:
              str = t('Awake');
              break;
            case null:
              str = t('Out of Bed');
              break;
            default:
              break;
          }
          return `${str}<br/>${moment((params[0].value)[0]).format('MM-DD HH:mm')}`;
        }
      },
      xAxis: {
        type: 'time',
        splitNumber: 12,
        min: sleepStageStart,
        max: sleepStageEnd,
        axisTick: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: '#aaa'
          }
        },
        axisLabel: {
          showMinLabel: true,
          showMaxLabel: true,
          formatter: (value, index) => moment(value).format('HH:mm')
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: '#efefef',
            type: 'solid'
          }
        },
      },
      yAxis: {
        name: t('睡眠分期'),
        type: 'value',
        min: 0,
        max: 4,
        splitLine: {
          show: true,
          lineStyle: {
            color: '#efefef',
            type: 'solid'
          }
        },
        axisLine: {
          lineStyle: {
            color: '#aaa'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          // rotate: 45,
          formatter: (v) => {
            switch (v) {
              case 1:
                return 'D';
              case 2:
                return 'L';
              case 3:
                return 'R';
              case 4:
                return 'W';
              default:
                break;
            }
          }
        },
      },
      series: {
        name: '分期曲线',
        type: 'line',
        // animation: false,
        symbol: 'none',
        // itemStyle: {
        //   normal: {
        //     color: "#333"
        //   }
        // },
        lineStyle: {
          width: 2
        },
        // markLine: {
        //   data: leaveArr,
        //   symbol: 'pin',
        //   label: {
        //     show: false,
        //     formatter: function (params) {
        //       return dayjs(params.value).format('HH:mm离床');
        //     },
        //   },
        //   lineStyle: {
        //     color: 'red',
        //     type: 'solid'
        //   }
        // },
        // smooth: true,
        // sampling: 'average',
        data,
      }
      // ,{
      //   name: '离床',
      //   type: 'line',
      //   smooth: true,
      //   symbol: 'none',
      //   sampling: 'average',
      //   itemStyle: {
      //     normal: {
      //       color: '#ccc'
      //     }
      //   },
      //   areaStyle: {
      //     normal: {
      //       color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
      //         offset: 0,
      //         color: '#ccc'
      //       }, {
      //         offset: 1,
      //         color: '#ccc'
      //       }])
      //     }
      //   },
      //   data: data.leaveArr
      // }
    };

    return option;
  }

  render() {
    return (
      <div className="block">
        <ReactEcharts option={this.getOption()}  style={{ height:'2.4rem' }} />
      </div>
    );
  }
}

StageChart.propTypes = {
  startSleepTime: PropTypes.number.isRequired,
  startStatusTimeMinute: PropTypes.number.isRequired,
  endStatusTimeMinute: PropTypes.number.isRequired,
  sleepData: PropTypes.array.isRequired,
};

const mapStateToProps = state => (
  {
    startSleepTime: state.report.data.startSleepTime,
    startStatusTimeMinute: state.report.data.startStatusTimeMinute,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
    sleepData: state.report.data.sleepData,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StageChart));
