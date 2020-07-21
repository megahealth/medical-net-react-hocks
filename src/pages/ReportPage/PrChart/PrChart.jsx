import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
// import Creator from '../../../actions/Creator';

class PrChart extends Component {

  componentDidMount() {

  }

  getOption = () => {
    const {
      startSleepTime,
      startStatusTimeMinute,
      endStatusTimeMinute,
      spoStart,
      prArr,
    } = this.props;
    const len = prArr.length;

    if (len > 0) {
      const sleepStageStart = startSleepTime + startStatusTimeMinute * 60 * 1000;
      const sleepStageEnd = startSleepTime + endStatusTimeMinute * 60 * 1000;
      const realStart = 1000 * spoStart;
      let base = +new Date(realStart);
      const oneStep = 10 * 1000;
      const newPrArr = [];
      for (let i = 0; i < len; i += 10) {
        const now = new Date(base += oneStep);
        const spo = prArr[i];
        newPrArr.push([now, spo]);
      }

      const option = {
        animation: false,
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '2%',
          right: '3%',
          bottom: '5%',
          top: '14%',
          containLabel: true
        },
        // dataZoom: [{
        //   type: 'inside',
        //   start: 0,
        //   end: 100
        // }, {}],
        toolbox: {
          show: false,
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
              // icon: {
              //   back: '.'
              // },
              // title: {
              //   zoom: '开始裁剪',
              // }
            },
            // myTool1: {
            //   show: true,
            //   title: '重置',
            //   icon: 'path://M36.4,156.4a89.91,89.91,0,1,1,70,33.6,4,4,0,1,1,0-8c45.2,0,82-36.8,82-82.4s-36.8-82.4-82-82.4-82,36.8-82,82.4a79.88,79.88,0,0,0,18.4,51.6V121.6a4,4,0,0,1,4-4,3.78,3.78,0,0,1,4,4V160a4.1,4.1,0,0,1-4,4H8.4a4,4,0,0,1,0-8h28Z',
            //   onclick: () => {
            //     // initSpoChart(sleepStageStart, sleepStageEnd, 0,0,timeStart, spoArr, newSpo);
            //   }
            // },
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
            show: true,
            lineStyle: {
              color: '#efefef',
              type: 'solid'
            }
          },
        },
        yAxis: {
          name: '脉率(bpm)',
          type: 'value',
          nameRotate: '0.1',
          min: 40,
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
        },
        series: [{
          type: 'line',
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
          data: newPrArr,
        }]
      };

      return option;
    }
    return {};
  }

  render() {
    return (
      <div className="block">
        <ReactEcharts option={this.getOption()} style={{ height: '300px' }} />
      </div>
    );
  }
}

PrChart.propTypes = {
  startSleepTime: PropTypes.number.isRequired,
  startStatusTimeMinute: PropTypes.number.isRequired,
  endStatusTimeMinute: PropTypes.number.isRequired,
  spoStart: PropTypes.number.isRequired,
  prArr: PropTypes.array.isRequired,
};

const mapStateToProps = state => (
  {
    startSleepTime: state.report.data.startSleepTime,
    startStatusTimeMinute: state.report.data.startStatusTimeMinute,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
    spoStart: state.report.alreadyDecodedData.timeStart,
    prArr: state.report.alreadyDecodedData.prArr,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(PrChart);