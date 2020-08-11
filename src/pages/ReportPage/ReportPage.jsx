import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Skeleton, Button } from 'antd';
import {
  LeftOutlined,
  // EditOutlined,
  // PrinterOutlined,
  // SaveOutlined
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

  render() {
    const { report, t } = this.props;
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
                onClick={() => this.props.history.goBack()}
              >
                {t('Back')} 
              </Button>
            </div>
            {/* <div className="right">
              <Button shape="round" icon={<EditOutlined />} size={size}> {t('Edit')} </Button>
              <Button shape="round" icon={<SaveOutlined />} size={size}> {t('Save')} </Button>
              <Button shape="round" icon={<PrinterOutlined />} size={size}> {t('Print')} </Button>
            </div> */}
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
    data: PropTypes.object
  }).isRequired,
  match: PropTypes.object.isRequired,
  getReportData: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ReportPage));
