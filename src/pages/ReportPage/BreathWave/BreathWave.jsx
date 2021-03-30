import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
import { Typography } from 'antd';
import { withTranslation } from 'react-i18next';
import './index.scss'

const { Title } = Typography;

class BreathWave extends Component {

  state = {
    fullscreen: false
  }

  setFullscreen = () => {
    let element = document.documentElement;
    const { fullscreen } = this.state;
    if (fullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
    this.setState({
      fullscreen: !fullscreen
    })
  }

  getOption = () => {
    const {
      startSleepTime,
      startStatusTimeMinute,
      endStatusTimeMinute,
      breathList,
      breathEvent,
      spoStart,
      spoArr,
      prArr,
      waveData,
      bodyMoveListInfo,
      bodyMoveList,
      t
    } = this.props;
    const sleepStageStart = startSleepTime + startStatusTimeMinute * 60 * 1000;
    const sleepStageEnd = startSleepTime + endStatusTimeMinute * 60 * 1000;

    const len = spoArr.length;
    const prlen = prArr.length;
    let newSpoArr = [];
    let newPrArr = [];
    if (len > 0) {
      const realStart = 1000 * spoStart;
      let base = +new Date(realStart);
      const oneStep = 1 * 1000;
      for (let i = 0; i < len; i += 1) {
        const now = new Date(base += oneStep);
        const spo = spoArr[i];
        newSpoArr.push([now, spo]);
      }
    }
    if (prlen > 0) {
      const realStart = 1000 * spoStart;
      let base = +new Date(realStart);
      const oneStep = 1 * 1000;
      for (let i = 0; i < len; i += 1) {
        const now = new Date(base += oneStep);
        const spo = prArr[i];
        newPrArr.push([now, spo]);
      }
    }

    let breathEventChartData = [];
    let areas = [];

    const data = (breathList && breathEvent) || [];

    for (let i = 0; i < data.length; i++) {
      const breathEventTime = new Date(data[i][0] * 1000);
      const breathEventData = data[i][1];
      breathEventChartData.push([breathEventTime, breathEventData]);
      areas.push( [{ 
        xAxis: data[i][0]*1000,
      },{
        xAxis: (data[i][0] + data[i][1])*1000 
      }] )
    }

    let waveChartData = [];
    for (let i = 0; i < waveData.length; i++) {
      const minuteWave = waveData[i];
      const minuteWaveStart = minuteWave[0]*1000;
      const minuteWaveLength = minuteWave[1];
      const minuteWaveData = minuteWave[2];
      const minuteWaveInterval = Math.round((60000/minuteWaveLength)*100)/100;
      for (let j = 0; j < minuteWaveLength; j+=10) {
        const d = minuteWaveData[j];
        const t = minuteWaveStart + minuteWaveInterval*j;
        waveChartData.push([t, d])
      }
    }

    const bodyMoveStart = bodyMoveListInfo && bodyMoveListInfo.startTime * 1000;
    const bodyMoveInterval = bodyMoveListInfo && bodyMoveListInfo.interval;

    const bodyMoveTimeChartData = [];
    for (let i = 0; i < bodyMoveList.length; i++) {
      const bodyMoveTimeTime = new Date(bodyMoveStart + i * bodyMoveInterval * 1000);
      const bodyMoveTimeData = bodyMoveList[i][0];
      bodyMoveTimeChartData.push([bodyMoveTimeTime, bodyMoveTimeData]);
    }

    const option = {
      animation: false,
      legend: {
        // data: [t('Breath Wave'), t('Sleep Respiratory Event'), t('Blood Oxygen'), t('Heart Rate'), t('Body Movement')],
        data: [t('Breath Wave'), t('Blood Oxygen'), t('Heart Rate'), t('Body Movement')],
        top: 20
      },
      tooltip: {
        trigger: 'axis',
      },
      toolbox: {
        right: '10%',
        feature: {
          myTool1: {
            show: true,
            title: t('Fullscreen'),
            icon: 'path://M128 384h85.33V213.33H384V128H128zM640 128v85.33h170.67V384H896V128zM810.67 810.67H640V896h256V640h-85.33zM213.33 640H128v256h256v-85.33H213.33z',
            onclick: () => {
              this.setFullscreen()
            }
          },
        }
      },
      axisPointer: {
        link: {xAxisIndex: 'all'}
      },
      xAxis: [
        {
          type: 'time',
          show: false,
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
            formatter: (value, index) => moment(value).format('HH:mm:ss')
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#efefef',
              type: 'solid'
            }
          },
        },
        // {
        //   type: 'time',
        //   show: false,
        //   splitNumber: 12,
        //   min: sleepStageStart,
        //   max: sleepStageEnd,
        //   axisTick: {
        //     show: false,
        //   },
        //   axisLine: {
        //     lineStyle: {
        //       color: '#aaa'
        //     }
        //   },
        //   axisLabel: {
        //     showMinLabel: true,
        //     showMaxLabel: true,
        //     formatter: (value, index) => moment(value).format('HH:mm')
        //   },
        //   splitLine: {
        //     show: true,
        //     lineStyle: {
        //       color: '#efefef',
        //       type: 'solid'
        //     }
        //   },
        //   gridIndex: 1
        // },
        {
          type: 'time',
          show: false,
          splitNumber: 12,
          min: sleepStageStart,
          max: sleepStageEnd,
          axisTick: {
            show: true,
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
            show: true,
            lineStyle: {
              color: '#efefef',
              type: 'solid'
            }
          },
          gridIndex: 1
        },
        {
          type: 'time',
          show: false,
          splitNumber: 12,
          min: sleepStageStart,
          max: sleepStageEnd,
          axisTick: {
            show: true,
          },
          axisLine: {
            lineStyle: {
              color: '#aaa'
            }
          },
          axisLabel: {
            showMinLabel: true,
            showMaxLabel: true,
            formatter: (value, index) => moment(value).format('HH:mm:ss')
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: '#efefef',
              type: 'solid'
            }
          },
          gridIndex: 2
        },
        {
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
            show: true,
            lineStyle: {
              color: '#efefef',
              type: 'solid'
            }
          },
          gridIndex: 3
        }
      ],
      yAxis: [
        {
          name: t('Breath Wave'),
          nameLocation: 'center',
          nameGap: '30',
          type: 'value',
          // nameRotate: '0.1',
          splitLine: {
            show: true,
            lineStyle: {
              color: '#efefef',
              type: 'solid'
            }
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#aaa'
            }
          },
        },
        // {
        //   name: t('SR Event'),
        //   nameLocation: 'center',
        //   nameGap: '50',
        //   // nameRotate: '90',
        //   type: 'value',
        //   min: 0,
        //   max: 100,
        //   splitLine: {
        //     show: true,
        //     lineStyle: {
        //       color: '#efefef',
        //       type: 'solid'
        //     }
        //   },
        //   axisTick: {
        //     show: false,
        //   },
        //   axisLine: {
        //     lineStyle: {
        //       color: '#aaa'
        //     }
        //   },
        //   gridIndex: 1
        // },
        {
          name: t('Blood Oxygen'),
          nameLocation: 'center',
          nameGap: '50',
          type: 'value',
          // nameRotate: '0.1',
          min: 0,
          max: 100,
          boundaryGap: [0, '100%'],
          axisLine: {
            lineStyle: {
              color: '#aaa'
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#efefef',
              type: 'solid'
            }
          },
          gridIndex: 1
        },
        {
          name: t('Heart Rate'),
          nameLocation: 'center',
          nameGap: '50',
          type: 'value',
          // nameRotate: '0.1',
          min: 40,
          max: 120,
          boundaryGap: [0, '100%'],
          axisLine: {
            lineStyle: {
              color: '#aaa'
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#efefef',
              type: 'solid'
            }
          },
          gridIndex: 2
        },
        {
          name: t('Body Movement'),
          nameLocation: 'center',
          nameGap: '50',
          type: 'value',
          // nameRotate: '0.1',
          min: 0,
          max: 60,
          splitLine: {
            show: true,
            lineStyle: {
              color: '#efefef',
              type: 'solid'
            }
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#aaa'
            }
          },
          gridIndex: 3
        }
      ],
      // grid: [{
      //   top: '12%',
      //   bottom: '76%'
      // }, {
      //   top: '28%',
      //   bottom: '60%'
      // }, {
      //   top: '44%',
      //   bottom: '44%'
      // }, {
      //   top: '60%',
      //   bottom: '28%'
      // }, {
      //   top: '76%',
      //   bottom: '12%'
      // }],
      grid: [{
          top: '12%',
          bottom: '74%'
        }, {
          top: '32%',
          bottom: '54%'
        }, {
          top: '54%',
          bottom: '32%'
        }, {
          top: '74%',
          bottom: '12%'
        }],
      dataZoom: [
        {
          show: true,
          type: 'slider',
          start: 10,
          end: 11,
          // xAxisIndex: [0, 1, 2, 3, 4]
          xAxisIndex: [0, 1, 2, 3]
        },
        {
          show: true,
          type: 'inside',
          start: 10,
          end: 11,
          // xAxisIndex: [0, 1, 2, 3, 4]
          xAxisIndex: [0, 1, 2, 3]
        },
      ],
      series: [
        {
          name: t('Breath Wave'),
          type: 'line',
          showSymbol: false,
          hoverAnimation: false,
          lineStyle: {
            width: 1
          },
          itemStyle: {
            normal: {
              color: '#7367F0',
            }
          },
          data: waveChartData,
          markArea: {
            data: areas
          }
        },
        // {
        //   name: t('Sleep Respiratory Event'),
        //   type: 'bar',
        //   barWidth: 1,
        //   itemStyle: {
        //     normal: {
        //       color: '#FA742B',
        //       // width: 1
        //     }
        //   },
        //   data: breathEventChartData,
        //   xAxisIndex: 1,
        //   yAxisIndex: 1
        // },
        {
          type: 'line',
          name: t('Blood Oxygen'),
          showSymbol: false,
          hoverAnimation: false,
          lineStyle: {
            width: 1
          },
          itemStyle: {
            normal: {
              color: '#ff4e50',
            }
          },
          data: newSpoArr,
          xAxisIndex: 1,
          yAxisIndex: 1
        },
        {
          type: 'line',
          name: t('Heart Rate'),
          showSymbol: false,
          hoverAnimation: false,
          lineStyle: {
            width: 1
          },
          itemStyle: {
            normal: {
              color: '#28C76F',
            }
          },
          data: newPrArr,
          xAxisIndex: 2,
          yAxisIndex: 2
        },
        {
          name: t('Body Movement'),
          type: 'bar',
          barWidth: 1,
          itemStyle: {
            normal: {
              color: '#ff4e50',
            }
          },
          data: bodyMoveTimeChartData,
          xAxisIndex: 3,
          yAxisIndex: 3
        }
      ]
    };

    return option;
  }

  render() { 
    const { fullscreen } = this.state;
    const { t } = this.props;

    return (
      <div className={`block  ${fullscreen?'full-screen':''}`}>
        <Title level={2}>{t('Breath Wave Trend')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <ReactEcharts option={this.getOption()} style={{ height: '600px' }} />
      </div>
    );
  }
}

BreathWave.propTypes = {
  startSleepTime: PropTypes.number.isRequired,
  startStatusTimeMinute: PropTypes.number.isRequired,
  endStatusTimeMinute: PropTypes.number.isRequired,
  breathList: PropTypes.array.isRequired,
  spoStart: PropTypes.number.isRequired,
  spoArr: PropTypes.array.isRequired,
  prArr: PropTypes.array.isRequired,
  // waveData: PropTypes.array.waveData,
};

const mapStateToProps = state => (
  {
    startSleepTime: state.report.data.startSleepTime,
    startStatusTimeMinute: state.report.data.startStatusTimeMinute,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
    breathList: state.report.data.breathList,
    breathEvent: state.report.alreadyDecodedData.BreathEventVect,
    spoStart: state.report.alreadyDecodedData.timeStart,
    spoArr: state.report.alreadyDecodedData.Spo2Arr,
    prArr: state.report.alreadyDecodedData.prArr,
    waveData: state.report.waveData,
    bodyMoveListInfo: state.report.data.bodyMoveListInfo,
    bodyMoveList: state.report.data.bodyMoveList?state.report.data.bodyMoveList:[],
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);
 
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(BreathWave));;