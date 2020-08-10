import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Typography } from 'antd';
import { withTranslation } from 'react-i18next';

const { Title } = Typography;

class ReportHeader extends Component {

  getReportDate() {
    const { startSleepTime, endStatusTimeMinute, t } = this.props;
    const time = startSleepTime + endStatusTimeMinute * 60 * 1000;
    return moment(time).format( t('YYYY-MM-DD') );
  }

  render() {
    const { deviceSN, t } = this.props;
    return (
      <div className="header">
        <div className="header-info">
          {/* <span>病历号：2626543</span> */}
          <span>
            {t('Device SN')}：
            {deviceSN}
          </span>
        </div>
        <div className="center">
          <Title>{t('Report Title')}</Title>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ReportHeader));
