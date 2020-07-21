import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
import { Typography } from 'antd';

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
      console.log('已还原！');
    } else {    // 否则，进入全屏
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        // IE11
        element.msRequestFullscreen();
      }
      console.log('已全屏！');
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
      waveData
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
    const data = breathList && breathEvent;

    for (let i = 0; i < data.length; i++) {
      const breathEventTime = new Date(data[i][0] * 1000);
      const breathEventData = data[i][1];
      breathEventChartData.push([breathEventTime, breathEventData]);
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

    const option = {
      animation: false,
      legend: {
        data: ['呼吸波', '呼吸事件', '血氧', '脉率'],
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
            title: '全屏',
            icon: 'path://M128 384h85.33V213.33H384V128H128zM640 128v85.33h170.67V384H896V128zM810.67 810.67H640V896h256V640h-85.33zM213.33 640H128v256h256v-85.33H213.33z',
            onclick: () => {
              this.setFullscreen()
            }
          },
        }
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
            formatter: (value, index) => moment(value).format('HH:mm')
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
          type: 'time',
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
          gridIndex: 3
        },
      ],
      yAxis: [
        {
          name: '呼吸波',
          nameLocation: 'center',
          nameGap: '50',
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
        {
          name: '呼吸事件',
          nameLocation: 'center',
          nameGap: '50',
          // nameRotate: '90',
          type: 'value',
          min: 0,
          max: 100,
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
          gridIndex: 1
        },
        {
          name: '血氧(%)',
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
          gridIndex: 2
        },
        {
          name: '脉率(bpm)',
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
          gridIndex: 3
        },
      ],
      grid: [{
        top: '12%',
        bottom: '72%'
      }, {
        top: '32%',
        bottom: '52%'
      }, {
        top: '52%',
        bottom: '32%'
      }, {
        top: '72%',
        bottom: '12%'
      }],
      dataZoom: [
        {
          show: true,
          type: 'slider',
          start: 10,
          end: 11,
          xAxisIndex: [0, 1, 2, 3]
        },
        {
          show: true,
          type: 'inside',
          start: 10,
          end: 11,
          xAxisIndex: [0, 1, 2, 3]
        },
      ],
      series: [
        {
          name: '呼吸波',
          type: 'bar',
          // showSymbol: false,
          // hoverAnimation: false,
          // lineStyle: {
          //   width: 1
          // },
          barWidth: 1,
          itemStyle: {
            normal: {
              color: '#7367F0',
              // width: 1
            }
          },
          data: waveChartData
        },
        {
          name: '呼吸事件',
          type: 'bar',
          barWidth: 1,
          itemStyle: {
            normal: {
              color: '#FA742B',
              // width: 1
            }
          },
          data: breathEventChartData,
          xAxisIndex: 1,
          yAxisIndex: 1
        },
        {
          type: 'line',
          name: '血氧',
          // smooth: true,
          // sampling: 'average',
          showSymbol: false,
          hoverAnimation: false,
          lineStyle: {
            width: 1
          },
          itemStyle: {
            normal: {
              color: '#ff4e50',
              // width: 1
            }
          },
          data: newSpoArr,
          xAxisIndex: 2,
          yAxisIndex: 2
        },
        {
          type: 'line',
          name: '脉率',
          // smooth: true,
          // sampling: 'average',
          showSymbol: false,
          hoverAnimation: false,
          lineStyle: {
            width: 1
          },
          itemStyle: {
            normal: {
              color: '#28C76F',
              // width: 1
            }
          },
          data: newPrArr,
          xAxisIndex: 3,
          yAxisIndex: 3
        }
      ]
    };

    return option;
  }

  render() { 

    const { fullscreen } = this.state;

    return (
      <div className={`block  ${fullscreen?'full-screen':''}`}>
        <Title level={2}>呼吸波趋势图</Title>
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
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);
 
export default connect(mapStateToProps, mapDispatchToProps)(BreathWave);;