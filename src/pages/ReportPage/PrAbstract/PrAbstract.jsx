import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography } from 'antd';
// import Creator from '../../../actions/Creator';

const { Title } = Typography;

class PrAbstract extends Component {
  componentDidMount() {

  }

  render() {
    const {
      prAvg,
      prMax,
      prMin,
    } = this.props;

    return (
      <div className="block">
        <Title level={2}>心率统计</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>{ prAvg }</span>
            <span>平均心率(bpm)</span>
          </span>
          <span>
            <span>{ prMax }</span>
            <span>最大心率(bpm)</span>
          </span>
          <span>
            <span>{ prMin }</span>
            <span>最小心率(bpm)</span>
          </span>
        </div>
      </div>
    );
  }
}

PrAbstract.propTypes = {
  prAvg: PropTypes.number.isRequired,
  prMax: PropTypes.number.isRequired,
  prMin: PropTypes.number.isRequired,
};

const mapStateToProps = state => (
  {
    prAvg: state.report.alreadyDecodedData.prAvg,
    prMax: state.report.alreadyDecodedData.prMax,
    prMin: state.report.alreadyDecodedData.prMin,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(PrAbstract);
