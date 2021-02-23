import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
import { withTranslation } from 'react-i18next';
import AV from 'leancloud-storage';
class EventsChart extends Component {

  getOption = () => {
    const currentUser = AV.User.current();
    const {
      startSleepTime,
      startStatusTimeMinute,
      endStatusTimeMinute,
      breathList,
      breathEvent,
      t
    } = this.props;
    const sleepStageStart = startSleepTime + startStatusTimeMinute * 60 * 1000;
    const sleepStageEnd = startSleepTime + endStatusTimeMinute * 60 * 1000;

    const breathEventChartData = [];
    const data = (breathList) || [];
    for (let i = 0; i < data.length; i++) {
      var breathEventTime;
      if(currentUser.id == '5c665a7b2438920054eb3f93'){
        breathEventTime = new Date(sleepStageStart + data[i][0] * 1000);
      }else{
        breathEventTime = new Date(data[i][0] * 1000);
      }
      
      const breathEventData = data[i][1];
      breathEventChartData.push([breathEventTime, breathEventData]);
    }
    const option = {
      animation: false,
      grid: {
        left: '4%',
        right: '3%',
        bottom: '5%',
        top: '20%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        show: true,
      },
      xAxis: [
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
            formatter: (value, index) =>moment(value).format('HH:mm')
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#efefef',
              type: 'solid'
            }
          },
        }
      ],
      yAxis: [{
        name: t('Chart Sec Duration'),
        type: 'value',
        nameRotate: '0.1',
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
      }],
      series: [
        {
          name: t('Sleep Respiratory Event Chart'),
          type: 'bar',
          barWidth: 1,
          itemStyle: {
            normal: {
              color: '#ff4e50',
              // width: 1
            }
          },
          data: breathEventChartData
        }
      ]
    };

    return option;
  }

  render() {
    return (
      <div className="block">
        <ReactEcharts option={this.getOption()}  style={{ height:'2.6rem' }} />
      </div>
    );
  }
}

EventsChart.propTypes = {
  startSleepTime: PropTypes.number.isRequired,
  startStatusTimeMinute: PropTypes.number.isRequired,
  endStatusTimeMinute: PropTypes.number.isRequired,
  breathList: PropTypes.array.isRequired,
};

const mapStateToProps = state => (
  {
    startSleepTime: state.report.data.startSleepTime,
    startStatusTimeMinute: state.report.data.startStatusTimeMinute,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
    breathList: state.report.data.breathList,
    breathEvent: state.report.alreadyDecodedData.BreathEventVect,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EventsChart));
