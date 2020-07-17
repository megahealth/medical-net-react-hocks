import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Typography } from 'antd';
// import Creator from '../../../actions/Creator';
// import '../../ReportPage.scss';


const { Title } = Typography;


class ReportHeader extends Component {
  componentDidMount() {

  }

  getReportDate() {
    const { startSleepTime, endStatusTimeMinute } = this.props;
    const t = startSleepTime + endStatusTimeMinute * 60 * 1000;
    return moment(t).format('YYYY年MM月DD日');
  }

  render() {
    const { deviceSN } = this.props;
    return (
      <div className="header">
        <div className="header-info">
          <span>病历号：2626543</span>
          <span>
            设备编号：
            {deviceSN}
          </span>
        </div>
        <div className="center">
          <Title>睡眠呼吸报告</Title>
          <span>
            {
              this.getReportDate()
            }
          </span>
        </div>
      </div>
    );
  }
}

ReportHeader.propTypes = {
  deviceSN: PropTypes.string.isRequired,
  startSleepTime: PropTypes.number.isRequired,
  endStatusTimeMinute: PropTypes.number.isRequired,
};

const mapStateToProps = state => (
  {
    deviceSN: state.report.data.remoteDevice.deviceSN,
    startSleepTime: state.report.data.startSleepTime,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(ReportHeader);
