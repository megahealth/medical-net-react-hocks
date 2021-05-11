import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Skeleton, Button } from 'antd';
import {
  LeftOutlined,
  EditOutlined,
  PrinterOutlined,
  SaveOutlined,
  CloseSquareOutlined
} from '@ant-design/icons';
import { withTranslation } from 'react-i18next';
import './ReportPage.scss';

import ReportHeader from './Header/ReportHeader';
import UserInfo from './UserInfo/UserInfo';
import AbstractData from './Abstract/AbstractData';
import SleepTime from './SleepTime/SleepTime';
import RespiratoryEvents from './RespiratoryEvents/RespiratoryEvents';
import SleepStage from './SleepStage/SleepStage';
import StagePieChart from './StagePieChart/StagePieChart';
import SpoAbstract from './SpoAbstract/SpoAbstract';
import SpoRange from './SpoRange/SpoRange';
import PrAbstract from './PrAbstract/PrAbstract';
import Advice from './Advice/Advice';
import SpoChart from './SpoChart/SpoChart';
import PrChart from './PrChart/PrChart';
import EventsChart from './EventsChart/EventsChart';
import StageChart from './StageChart/StageChart';
import BreathWave from './BreathWave/BreathWave';
import BodyMoveTimeChart from './BodyMoveTimeChart/BodyMoveTimeChart';
import moment from 'moment';
import Creator from '../../actions/Creator';
import echarts from 'echarts';
class ReportPage extends Component {
  constructor(props) {
    super(props);
    this.id = props.match.params.id;
  }

  state = {
    size: 'large',
    isResize: false
  };

  componentDidMount() {
    const { getReportData } = this.props;
    getReportData(this.id);
  }

  exitEdit = () => {
    const { cancelUpdate, changeEditStatus } = this.props
    cancelUpdate()
    changeEditStatus()
  }

  saveUserEdit = () => {
    const { saveUpdate, report } = this.props;
    const { adviceData,patientInfo } = report;
    // console.log({ adviceData, patientInfo}, this.id);
    saveUpdate({ adviceData,patientInfo }, this.id)

  }

  saveAdviceEdit = () => {
    const { saveUpdate, report } = this.props;
    const { adviceData,patientInfo } = report;
    saveUpdate({ adviceData,patientInfo }, this.id)
  }

  print = () => {
    const { report } = this.props;
    const { startSleepTime, endStatusTimeMinute } = report.data;
    const time = startSleepTime + endStatusTimeMinute * 60 * 1000;
    const reportDay = moment(time).format('YYYY-MM-DD');
    document.title = report.patientInfo&&report.patientInfo.name ? (reportDay + "-" + report.patientInfo.name) : (reportDay + "-未填写");
    let reportId = report.id;
    if(typeof (window.mPlusObject) === 'undefined'){
      // this.resize_echart(750)
    }else{
      // this.resize_echart(750)
    }
    
    
    setTimeout(() => {
      if (typeof (window.mPlusObject) === 'undefined') {
          window.print();
      } else {
        window.mPlusObject&&window.mPlusObject.printReport(reportId);
      }
      this.resize_echart('auto')
    }, 0);
    document.title = '睡眠呼吸评估报告';
  }
  // 调整打印时图表的宽度
  resize_echart(width){
    const echartArr = document.querySelectorAll('.print-echart-resize .echarts-for-react');
    console.log('aaaaaaaaaaaa',echartArr);
    echartArr.forEach((item)=>{
      echarts.getInstanceByDom(item).resize({
        width:width
      })
    })
  }

  render() {
    const { report, t, changeEditStatus } = this.props;
    const reportConfig = report.data.idBaseOrg&&report.data.idBaseOrg.get('reportConfig');
    const { isEditting } = report
    const { size } = this.state;
    let isShow = false;
    if(report.alreadyDecodedData){
      const { prArr, Spo2Arr } = report.alreadyDecodedData;
      if(prArr.length>0&&Spo2Arr.length>0) isShow = true;
    }
    return (
      <div className="container-report container-report-background">
        <div className="wrapper">
          <div className="option print-hide">
            <div className="left">
              <Button
                shape="round"
                icon={<LeftOutlined />}
                size={size}
                onClick={
                  () => {
                    // this.props.history.goBack();
                    this.props.history.push(`/app/allreports?true`);
                    if (isEditting) { this.exitEdit() }
                  }
                }
              >
                {t('Back')}
              </Button>
            </div>
            <div className="right">
              {
                isEditting
                  ?
                  <div className="hide-print option-btns">
                    <Button shape="round" icon={<SaveOutlined />} size={size} onClick={this.saveUserEdit}> {t('Save')} </Button>
                    <Button shape="round" icon={<CloseSquareOutlined />} size={size} onClick={this.exitEdit} > {t('Exit')} </Button>
                  </div>
                  :
                  <div className="hide-print option-btns">
                    <Button shape="round" icon={<PrinterOutlined />} size={size} onClick={this.print}> {t('Print')}</Button>
                    <Button 
                      shape="round" icon={<EditOutlined />} 
                      size={size} 
                      onClick={changeEditStatus} 
                    > {t('Edit')} </Button>
                  </div>
              }
            </div>
          </div>
          
          <Skeleton paragraph={{ rows: 15 }} loading={report.loading}>
            <div className="print-page">
              <ReportHeader showInput={true}></ReportHeader>
              <UserInfo></UserInfo>
              <AbstractData></AbstractData>
              <SleepTime></SleepTime>
              <RespiratoryEvents></RespiratoryEvents>
              <SleepStage></SleepStage>
              <StagePieChart></StagePieChart>
            </div>
            {
              isShow ?
                <div className="print-page">
                  <ReportHeader></ReportHeader>
                  <SpoAbstract></SpoAbstract>
                  <SpoRange></SpoRange>
                  <PrAbstract></PrAbstract>
                  <Advice></Advice>
                </div>
              :
              <div className="print-page">
                <ReportHeader></ReportHeader>
                <Advice></Advice>
              </div>
            }
            {
              isShow ?
              <div className="print-page">
              <ReportHeader></ReportHeader>
              <SpoChart></SpoChart>
              <PrChart></PrChart>
              <EventsChart></EventsChart>
              <StageChart></StageChart>
              {/* <BodyMoveTimeChart></BodyMoveTimeChart> */}
            </div>
              :
              <div className="print-page">
              <ReportHeader></ReportHeader>
              <EventsChart></EventsChart>
              <StageChart></StageChart>
            </div>
            }

            {/* <div className="print-page">
              <ReportHeader></ReportHeader>
              <SpoChart></SpoChart>
              <PrChart></PrChart>
              <EventsChart></EventsChart>
              <StageChart></StageChart>
            </div> */}
            {
              reportConfig&&reportConfig.breathChart?
              <div className="print-page">
                <BreathWave></BreathWave>
              </div>
              :null
            }
            
          </Skeleton>
        </div>
      </div>
    );
  }
}

ReportPage.propTypes = {
  report: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.bool,
    isEditting: PropTypes.bool,
    data: PropTypes.object,
    adviceData: PropTypes.object,
    patientInfo: PropTypes.object,
  }).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  saveUpdate: PropTypes.func.isRequired,
  cancelUpdate: PropTypes.func.isRequired,
  getReportData: PropTypes.func.isRequired,
  changeEditStatus: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    report: state.report,
  }
);

const mapDispatchToProps = dispatch => ({
  getReportData(id) {
    dispatch(Creator.getReportData(id));
  },
  changeEditStatus() {
    dispatch(Creator.changeEditStatus());
  },
  cancelUpdate() {
    dispatch(Creator.cancelUpdate())
  },
  saveUpdate(data, id) {
    dispatch(Creator.saveUpdate(data, id))
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ReportPage));
