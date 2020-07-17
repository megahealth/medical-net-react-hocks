import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography } from 'antd';
// import Creator from '../../../actions/Creator';

const { Title } = Typography;

class AbstractData extends Component {
  componentDidMount() {

  }

  getAHI() {
    const { AHI } = this.props;
    return AHI.toFixed(1);
  }

  render() {
    return (
      <div className="block">
        <Title level={2}>数据摘要</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>{ this.getAHI() }</span>
            <span>AHI指数</span>
          </span>
        </div>
      </div>
    );
  }
}

AbstractData.propTypes = {
  AHI: PropTypes.number.isRequired,
};

const mapStateToProps = state => (
  {
    AHI: state.report.data.AHI,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(AbstractData);
