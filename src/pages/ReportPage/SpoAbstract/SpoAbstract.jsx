import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography } from 'antd';
import { withTranslation } from 'react-i18next';

const { Title } = Typography;

class SpoAbstract extends Component {
  componentDidMount() {

  }

  render() {
    const { Spo2Avg, Spo2Min, diffThdLge3Cnts, diffThdLge3Pr, t } = this.props;
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
            <span>{ Spo2Min&&Spo2Min.toFixed(1) }</span>
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
};

const mapStateToProps = state => (
  {
    Spo2Avg: state.report.alreadyDecodedData.Spo2Avg,
    Spo2Min: state.report.alreadyDecodedData.Spo2Min,
    diffThdLge3Cnts: state.report.alreadyDecodedData.diffThdLge3Cnts,
    diffThdLge3Pr: state.report.alreadyDecodedData.diffThdLge3Pr,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SpoAbstract));
