import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Typography,Input } from 'antd';
import { withTranslation } from 'react-i18next';
import AV from 'leancloud-storage';

const { Title } = Typography;

class ReportHeader extends Component {
  state = {
    reportNum:null,
    status:false,
  }
  getReportDate() {
    const { startSleepTime, endStatusTimeMinute, t } = this.props;
    const time = startSleepTime + endStatusTimeMinute * 60 * 1000;
    return moment(time).format( t('YYYY-MM-DD') );
  }
  changeInputValue = (e) => {
    console.log(e.target.value);
    this.setState({
      reportNum:e.target.value,
      status:true
    })
  }
  inputFocus = () => {
    this.state.reportNum = this.props.reportNum;
    this.state.status = true;
  }
  inputBlur = () => {
    if(this.state.status){
      console.log('aaa',this.state.reportNum);
      this.state.status = false;
    }
  }
  saveChange = () => {
    
  }
  render() {
    const { deviceSN, t, reportNum, showInput } = this.props;
    return (
      <div className="header">
        <div className="header-info">
          {
            showInput
            ?<div style={{ display:'flex',justifyContent:'start',alignItems:'center',width:'150px' }}>
              <span style={{ display:'block',width:'70px' }}>病历号：</span>
              <div style={{ borderBottom:'1px solid black' }}>
                <Input 
                  bordered={false} 
                  value={this.state.reportNum==null ? reportNum : this.state.reportNum}
                  onFocus={this.inputFocus}
                  onBlur = { this.inputBlur }
                  onPressEnter = { this.inputBlur }
                  onChange = {this.changeInputValue}
                />
              </div>
            </div>
            :<span>病历号：{reportNum}</span>
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
  reportNum:PropTypes.string
};

const mapStateToProps = state => (
  {
    deviceSN: state.report.data.remoteDevice.deviceSN,
    startSleepTime: state.report.data.startSleepTime,
    endStatusTimeMinute: state.report.data.endStatusTimeMinute,
    reportNum:state.report.reportNum
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ReportHeader));
