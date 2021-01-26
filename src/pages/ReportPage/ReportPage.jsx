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

import Creator from '../../actions/Creator';

class ReportPage extends Component {
  constructor(props) {
    super(props);
    this.id = props.match.params.id;
  }

  state = {
    size: 'large',
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
    const { edition } = report;
    console.log(report.edition);
    console.log({adviceData:{},edition}, this.id);
    saveUpdate({adviceData:{},edition}, this.id)

  }

  saveAdviceEdit = () => {
    const { saveUpdate, report } = this.props;
    const { adviceData } = report;
    saveUpdate({adviceData, edition:{}}, this.id)
  }

  render() {
    const { report, t, changeEditStatus } = this.props;
    const { isEditting } = report

    const { size } = this.state;

    return (
      <div className="container">
        <div className="wrapper">
          <div className="option">
            <div className="left">
              <Button
                shape="round"
                icon={<LeftOutlined />}
                size={size}
                onClick={
                  () => { 
                    this.props.history.goBack(); 
                    if(isEditting){this.exitEdit()}
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
                    <Button shape="round" icon={<SaveOutlined />} size={size} onClick={ this.saveUserEdit }> {t('Save')} </Button>
                    <Button shape="round" icon={<CloseSquareOutlined />} size={size}  onClick={this.exitEdit} > {t('Exit')} </Button>
                  </div>
                  :
                  <div className="hide-print option-btns">
                    <Button shape="round" icon={<PrinterOutlined />} size={size}> {t('Print')} </Button>
                    <Button shape="round" icon={<EditOutlined />} size={size} onClick={changeEditStatus} > {t('Edit')} </Button>
                  </div>
              }
            </div>
          </div>
          <Skeleton paragraph={{ rows: 15 }} loading={report.loading}>
            <div className="print-page">
              <ReportHeader></ReportHeader>
              <UserInfo></UserInfo>
              <AbstractData></AbstractData>
              <SleepTime></SleepTime>
              <RespiratoryEvents></RespiratoryEvents>
              <SleepStage></SleepStage>
              <StagePieChart></StagePieChart>
            </div>
            <div className="print-page">
              <ReportHeader></ReportHeader>
              <SpoAbstract></SpoAbstract>
              <SpoRange></SpoRange>
              <PrAbstract></PrAbstract>
              <Advice></Advice>
            </div>
            <div className="print-page">
              <ReportHeader></ReportHeader>
              <SpoChart></SpoChart>
              <PrChart></PrChart>
              <EventsChart></EventsChart>
              <StageChart></StageChart>
              <BodyMoveTimeChart></BodyMoveTimeChart>
            </div>
            <div className="print-page">
              <BreathWave></BreathWave>
            </div>
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
    edition: PropTypes.object,
    adviceData: PropTypes.object,
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
  saveUpdate(data,id) {
    dispatch(Creator.saveUpdate(data,id))
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ReportPage));
