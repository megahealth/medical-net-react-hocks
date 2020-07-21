import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
// import Creator from '../../../actions/Creator';

class EventsChart extends Component {

  componentDidMount() {

  }

  getOption = () => {
    const {
      startSleepTime,
      startStatusTimeMinute,
      endStatusTimeMinute,
      breathList,
      breathEvent
    } = this.props;
    const sleepStageStart = startSleepTime + startStatusTimeMinute * 60 * 1000;
    const sleepStageEnd = startSleepTime + endStatusTimeMinute * 60 * 1000;

    const breathEventChartData = [];
    const data = breathList && breathEvent;
    for (let i = 0; i < data.length; i++) {
      const breathEventTime = new Date(data[i][0] * 1000);
      const breathEventData = data[i][1];
      breathEventChartData.push([breathEventTime, breathEventData]);
    }

    const option = {
      animation: false,
      grid: {
        left: '2%',
        right: '3%',
        bottom: '5%',
        top: '14%',
        containLabel: true
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
            formatter: (value, index) => moment(value).format('HH:mm')
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
        name: '持续时间(s)',
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
          name: '呼吸事件曲线',
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
        <ReactEcharts option={this.getOption()} style={{ height: '300px' }} />
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

export default connect(mapStateToProps, mapDispatchToProps)(EventsChart);
