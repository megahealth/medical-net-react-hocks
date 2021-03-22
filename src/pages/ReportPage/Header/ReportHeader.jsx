import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Typography, Input } from 'antd';
import { withTranslation } from 'react-i18next';
import AV from 'leancloud-storage';
import Creator from '../../../actions/Creator';
import { Toast } from 'antd-mobile';

const { Title } = Typography;

class ReportHeader extends Component {
  state = {
    reportNum: null,
    status: false,
  }
  getReportDate() {
    const { startSleepTime, endStatusTimeMinute, t } = this.props;
    const time = startSleepTime + endStatusTimeMinute * 60 * 1000;
    return moment(time).format(t('YYYY-MM-DD'));
  }
  changeInputValue = (e) => {
    console.log(e.target.value);
    this.setState({
      reportNum: e.target.value,
      status: true
    })
  }
  inputFocus = () => {
    this.state.reportNum = this.props.reportNum;
    this.state.status = true;
  }
  inputBlur = () => {
    if (this.state.status) {
      if (this.props.reportNum != this.state.reportNum) {
        this.saveChange()
      }
    }
  }
  saveChange = async () => {
    const { idModifiedReport, changeReportNum, id } = this.props;
    const reportNum = this.state.reportNum;
    var res = null;
    if (idModifiedReport) {
      const updateReportNum = AV.Object.createWithoutData('ModifiedReport', idModifiedReport.id);
      updateReportNum.set('reportNumber', reportNum);
      try {
        res = await updateReportNum.save();
      } catch (error) {
        console.log(error);
        Toast.fail('修改失败！', 1)
      }
    } else {
      const modifiedReport = new AV.Object('ModifiedReport');
      const updateReport = AV.Object.createWithoutData('Reports',id)
      modifiedReport.set('reportNumber', reportNum);
      res = await modifiedReport.save();
      updateReport.set('idModifiedReport',res)
      await updateReport.save()
    }
    changeReportNum({
      idModifiedReport: res,
      reportNum: reportNum,
    })
    this.state = {
      reportNum: null,
      status: false
    }
  }
  render() {
    const { deviceSN, t, reportNum, showInput } = this.props;
    return (
      <div className="header">
        <div className="header-info">
          {
            showInput
              ? <div style={{ display: 'flex', justifyContent:'space-evenly', alignItems: 'center' }}>
                <span style={{ display: 'block' }}>病例号：</span>
                <div style={{ borderBottom: '1px solid black' }}>
                  <Input
                    style={{fontSize:'12px'}}
                    bordered={false}
                    value={this.state.reportNum == null ? reportNum : this.state.reportNum}
                    onFocus={this.inputFocus}
                    onBlur={this.inputBlur}
                    onPressEnter={this.inputBlur}
                    onChange={this.changeInputValue}
                  />
                </div>
              </div>
              : <span>病例号：{reportNum}</span>
          }
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
  reportNum: PropTypes.string,
  idModifiedReport: PropTypes.object,
  id: PropTypes.string.isRequired,
  changeReportNum: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    deviceSN: state.report.data.remoteDevice.deviceSN,
    startSleepTime: state.report.data.startSleepTime,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
    reportNum: state.report.reportNum,
    idModifiedReport: state.report.data.idModifiedReport,
    id: state.report.id
  }
);

const mapDispatchToProps = dispatch => (
  {
    changeReportNum(params) {
      dispatch(Creator.changeReportNum(params))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ReportHeader));
