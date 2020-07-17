import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography } from 'antd';
// import Creator from '../../../actions/Creator';
import './SpoRange.scss';

const { Title } = Typography;


class SpoRange extends Component {
  componentDidMount() {

  }

  render() {
    const {
      spo2Less95TimePercent,
      spo2Less90TimePercent,
      spo2Less85TimePercent,
      spo2Less80TimePercent,
      spo2Less95Time,
      spo2Less90Time,
      spo2Less85Time,
      spo2Less80Time,
    } = this.props;

    return (
      <div className="block">
        <Title level={2}>血氧饱和度</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data stage-table">
          <span>
            <span>范围</span>
            <span>时长(分钟)</span>
            <span>百分比(%)</span>
          </span>
          <span>
            <span>&lt;95%</span>
            <span className="table-value">{ parseFloat(spo2Less95Time / 60, 10).toFixed(1) }</span>
            <span className="table-value">{ spo2Less95TimePercent }</span>
          </span>
          <span>
            <span>&lt;90%</span>
            <span className="table-value">{ parseFloat(spo2Less90Time / 60, 10).toFixed(1) }</span>
            <span className="table-value">{ spo2Less90TimePercent }</span>
          </span>
          <span>
            <span>&lt;85%</span>
            <span className="table-value">{ parseFloat(spo2Less85Time / 60, 10).toFixed(1) }</span>
            <span className="table-value">{ spo2Less85TimePercent }</span>
          </span>
          <span>
            <span>&lt;80%</span>
            <span className="table-value">{ parseFloat(spo2Less80Time / 60, 10).toFixed(1) }</span>
            <span className="table-value">{ spo2Less80TimePercent }</span>
          </span>
        </div>
      </div>
    );
  }
}

SpoRange.propTypes = {
  spo2Less95TimePercent: PropTypes.number.isRequired,
  spo2Less90TimePercent: PropTypes.number.isRequired,
  spo2Less85TimePercent: PropTypes.number.isRequired,
  spo2Less80TimePercent: PropTypes.number.isRequired,
  spo2Less95Time: PropTypes.number.isRequired,
  spo2Less90Time: PropTypes.number.isRequired,
  spo2Less85Time: PropTypes.number.isRequired,
  spo2Less80Time: PropTypes.number.isRequired,
};

const mapStateToProps = state => (
  {
    sleepData: state.report.data.sleepData,
    spo2Less95TimePercent: state.report.alreadyDecodedData.spo2Less95TimePercent,
    spo2Less90TimePercent: state.report.alreadyDecodedData.spo2Less90TimePercent,
    spo2Less85TimePercent: state.report.alreadyDecodedData.spo2Less85TimePercent,
    spo2Less80TimePercent: state.report.alreadyDecodedData.spo2Less80TimePercent,
    spo2Less95Time: state.report.alreadyDecodedData.spo2Less95Time,
    spo2Less90Time: state.report.alreadyDecodedData.spo2Less90Time,
    spo2Less85Time: state.report.alreadyDecodedData.spo2Less85Time,
    spo2Less80Time: state.report.alreadyDecodedData.spo2Less80Time,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(SpoRange);
