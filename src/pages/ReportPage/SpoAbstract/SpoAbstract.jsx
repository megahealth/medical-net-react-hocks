import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography } from 'antd';
// import Creator from '../../../actions/Creator';

const { Title } = Typography;

class SpoAbstract extends Component {
  componentDidMount() {

  }

  render() {
    const { Spo2Avg, Spo2Min, diffThdLge3Cnts, diffThdLge3Pr } = this.props;

    return (
      <div className="block">
        <Title level={2}>血氧统计</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>{ Spo2Avg }</span>
            <span>平均血氧饱和度(%)</span>
          </span>
          <span>
            <span>{ Spo2Min }</span>
            <span>最低血氧饱和度(%)</span>
          </span>
          <span>
            <span>{ diffThdLge3Cnts }</span>
            <span>氧减次数</span>
          </span>
          <span>
            <span>{ diffThdLge3Pr }</span>
            <span>氧减指数(次/小时)</span>
          </span>
        </div>
      </div>
    );
  }
}

SpoAbstract.propTypes = {
  Spo2Avg: PropTypes.number.isRequired,
  Spo2Min: PropTypes.number.isRequired,
  diffThdLge3Cnts: PropTypes.number.isRequired,
  diffThdLge3Pr: PropTypes.number.isRequired,
};

const mapStateToProps = state => (
  {
    Spo2Avg: state.report.alreadyDecodedData.Spo2Avg,
    Spo2Min: state.report.alreadyDecodedData.Spo2Min,
    diffThdLge3Cnts: state.report.alreadyDecodedData.diffThdLge3Cnts,
    diffThdLge3Pr: state.report.alreadyDecodedData.diffThdLge3Pr,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(SpoAbstract);
