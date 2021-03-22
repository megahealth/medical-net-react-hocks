import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography,Input } from 'antd';
import { withTranslation } from 'react-i18next';
import Creator from '../../../actions/Creator';

const { Title } = Typography;

class SpoAbstract extends Component {
  componentDidMount() {

  }

  render() {
    const { Spo2Avg, Spo2Min, diffThdLge3Cnts, diffThdLge3Pr, t, isEditting } = this.props;
    return (
      <div className="block">
        <Title level={2}>{t('Blood oxygen statistics')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>{ Spo2Avg&&Spo2Avg.toFixed(1) }</span>
            <span>{t('Average SpO2')}</span>
          </span>
          <span>
            {
              isEditting?
                <Input type="text" defaultValue={ Spo2Min&&Spo2Min.toFixed(1) }/>
              :<span>{ Spo2Min&&Spo2Min.toFixed(1) }</span>
            }
            <span>{t('Lowest SpO2')}</span>
          </span>
          <span>
            <span>{ diffThdLge3Cnts }</span>
            <span>{t('Num of Desat')}</span>
          </span>
          <span>
            <span>{ diffThdLge3Pr&&diffThdLge3Pr.toFixed(1) }</span>
            <span>{t('ODI')}</span>
          </span>
        </div>
      </div>
    );
  }
}

SpoAbstract.propTypes = {
  Spo2Avg: PropTypes.number.isRequired,
  Spo2Min: PropTypes.number.isRequired,
  diffThdLge3Cnts: PropTypes.number.isRequired,
  diffThdLge3Pr: PropTypes.number.isRequired,
  isEditting: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    Spo2Avg: state.report.alreadyDecodedData.Spo2Avg,
    Spo2Min: state.report.alreadyDecodedData.Spo2Min,
    diffThdLge3Cnts: state.report.alreadyDecodedData.diffThdLge3Cnts,
    diffThdLge3Pr: state.report.alreadyDecodedData.diffThdLge3Pr,
    isEditting: state.report.isEditting,
  }
);

const mapDispatchToProps = dispatch => (
  {
    handleInputChange(data){
      dispatch(Creator.handleInputChange({},data,{}))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SpoAbstract));
