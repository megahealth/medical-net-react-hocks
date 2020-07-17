import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography, Input } from 'antd';
// import Creator from '../../../actions/Creator';
import './Advice.scss';

const { Title } = Typography;
const { TextArea } = Input;

class Advice extends Component {
  componentDidMount() {

  }

  render() {
    // const { prAvg, prMax, prMin } = this.props;

    return (
      <div className="block">
        <Title level={2}>诊断意见</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="advice">
          <TextArea rows={10} />
        </div>
      </div>
    );
  }
}

Advice.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(Advice);
