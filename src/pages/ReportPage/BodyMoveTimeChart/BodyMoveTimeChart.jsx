import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
import { withTranslation } from 'react-i18next';

class BodyMoveTimeChart extends Component {

  getOption = () => {
    const {
      startSleepTime,
      startStatusTimeMinute,
      endStatusTimeMinute,
      bodyMoveListInfo,
      bodyMoveList,
      t
    } = this.props;
    const sleepStageStart = startSleepTime + startStatusTimeMinute * 60 * 1000;
    const sleepStageEnd = startSleepTime + endStatusTimeMinute * 60 * 1000;
    const start = bodyMoveListInfo && bodyMoveListInfo.startTime * 1000;
    const interval = bodyMoveListInfo && bodyMoveListInfo.interval;

    const bodyMoveTimeChartData = [];
    const data = bodyMoveList;
    for (let i = 0; i < data.length; i++) {
      const bodyMoveTimeTime = new Date(start + i * interval * 1000);
      const bodyMoveTimeData = data[i][0];
      bodyMoveTimeChartData.push([bodyMoveTimeTime, bodyMoveTimeData]);
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
        name: t('Chart Ratio'),
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
          name: t('Sleep Body Movement Ratio'),
          type: 'bar',
          barWidth: 1,
          itemStyle: {
            normal: {
              color: '#ff4e50',
              // width: 1
            }
          },
          data: bodyMoveTimeChartData
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

BodyMoveTimeChart.propTypes = {
  startSleepTime: PropTypes.number.isRequired,
  startStatusTimeMinute: PropTypes.number.isRequired,
  endStatusTimeMinute: PropTypes.number.isRequired,
  // bodyMoveList: PropTypes.array.bodyMoveList,
  // bodyMoveListInfo: PropTypes.object.bodyMoveListInfo,
};

const mapStateToProps = state => (
  {
    startSleepTime: state.report.data.startSleepTime,
    startStatusTimeMinute: state.report.data.startStatusTimeMinute,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
    bodyMoveListInfo: state.report.data.bodyMoveListInfo,
    bodyMoveList: state.report.data.bodyMoveList,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(BodyMoveTimeChart));
