import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Typography } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { withTranslation } from 'react-i18next';
const { Title } = Typography;

class SpoChart extends Component {
  spoTime = {
    minTime : null,
    maxTime : null,
  }
  getOption = () => {
    const {
      startSleepTime,
      startStatusTimeMinute,
      endStatusTimeMinute,
      spoStart,
      spoArr,
      t,
      modifiedReport
    } = this.props;
    const len = spoArr.length;
    console.log(spoArr);
    if (len >= 0) {
      let startSpoTime, endSpoTime;
      if(modifiedReport&&modifiedReport.attributes){
        startSpoTime = modifiedReport.attributes.startSpoTime;
        endSpoTime = modifiedReport.attributes.endSpoTime;
      }
      console.log(modifiedReport,startSpoTime, endSpoTime);
      const sleepStageStart = (startSleepTime + startStatusTimeMinute * 60 * 1000);
      const sleepStageEnd = (startSleepTime + endStatusTimeMinute * 60 * 1000);
      if(!startSpoTime||!endSpoTime){
        startSpoTime = sleepStageStart/1000;
        endSpoTime = sleepStageEnd/1000;
      }
      this.spoTime.minTime = sleepStageStart;
      this.spoTime.maxTime = sleepStageEnd;
      const realStart = 1000 * spoStart;
      let base = +new Date(realStart);
      const oneStep = 10 * 1000;
      const newSpoArr = [];
      let minSpo = 100;
      let maxSpo = 50;
      let sw = true;
      for (let i = 0; i < len; i += 10) {
        base += oneStep;
        if(base>=startSpoTime*1000 && base<=endSpoTime*1000){
          const now = new Date(base);
          const spo = spoArr[i];
          if(spo>maxSpo) maxSpo = parseInt(spo);
          if(spo !=0 && spo<minSpo) minSpo = parseInt(spo);
          newSpoArr.push([now, spo]);
        }
      }
      maxSpo += 10 - maxSpo%10
      minSpo -= minSpo%10
      const option = {
        animation: false,
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '2%',
          right: '3%',
          bottom: '5%',
          top: '20%',
          containLabel: true
        },
        // dataZoom: [{
        //   type: 'inside',
        //   start: 0,
        //   end: 100
        // }, {}],
        // toolbox: {
        //   show: false,
        //   feature: {
        //     dataZoom: {
        //       yAxisIndex: 'none',
        //       // icon: {
        //       //   back: '.'
        //       // },
        //       // title: {
        //       //   zoom: '开始裁剪',
        //       // }
        //     },
        //     // myTool1: {
        //     //   show: true,
        //     //   title: '重置',
        //     //   icon: 'path://M36.4,156.4a89.91,89.91,0,1,1,70,33.6,4,4,0,1,1,0-8c45.2,0,82-36.8,82-82.4s-36.8-82.4-82-82.4-82,36.8-82,82.4a79.88,79.88,0,0,0,18.4,51.6V121.6a4,4,0,0,1,4-4,3.78,3.78,0,0,1,4,4V160a4.1,4.1,0,0,1-4,4H8.4a4,4,0,0,1,0-8h28Z',
        //     //   onclick: () => {
        //     //     // initSpoChart(sleepStageStart, sleepStageEnd, 0,0,timeStart, spoArr, newSpo);
        //     //   }
        //     // },
        //   }
        // },
        dataZoom: [
          {
              type: 'slider',
              show: true,
              labelFormatter:(value) => {
                if(sw){
                  console.log('start',value);
                  sw = !sw
                  this.spoTime.minTime = value;
                }else{
                  console.log('end',value);
                  sw = !sw
                  this.spoTime.maxTime = value;
                }
                
              },
              // startValue: this.state.minTime,
              // endValue: this.state.maxTime,
              handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
              handleSize: '80%',
              handleStyle: {
                  color: '#fff',
                  shadowBlur: 3,
                  shadowColor: 'rgba(0, 0, 0, 0.6)',
                  shadowOffsetX: 2,
                  shadowOffsetY: 2
              },
              textStyle: false
          }
      ],
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
          name: t('血氧饱和度(%)'),
          type: 'value',
          nameRotate: '0.1',
          min: minSpo,
          max: maxSpo,
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
          data: newSpoArr,
        }]
      };

      return option;
    }
    return {};
  }
  log = () => {
    console.log(this.spoTime);
  } 
  render() {
    const { t } = this.props;

    return (
      <div className="block">
        <Title level={2}>{t('Trend Chart')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div>
          <button>1</button>
          <button>1</button>
          <button onClick={this.log}>1</button>
        </div>
        <ReactEcharts option={this.getOption()} style={{ height:'2.6rem' }} />
      </div>
    );
  }
}

SpoChart.propTypes = {
  startSleepTime: PropTypes.number.isRequired,
  startStatusTimeMinute: PropTypes.number.isRequired,
  endStatusTimeMinute: PropTypes.number.isRequired,
  spoStart: PropTypes.number.isRequired,
  spoArr: PropTypes.array.isRequired,
  modifiedReport: PropTypes.object
};

const mapStateToProps = state => (
  {
    modifiedReport: state.report.data.idModifiedReport,
    startSleepTime: state.report.data.startSleepTime,
    startStatusTimeMinute: state.report.data.startStatusTimeMinute,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
    spoStart: state.report.alreadyDecodedData.timeStart,
    spoArr: state.report.alreadyDecodedData.Spo2Arr,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SpoChart));
