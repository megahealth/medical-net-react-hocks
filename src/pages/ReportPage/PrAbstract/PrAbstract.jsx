import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography } from 'antd';
import { withTranslation } from 'react-i18next';

const { Title } = Typography;

class PrAbstract extends Component {

  render() {
    const {
      prAvg,
      prMax,
      prMin,
      t
    } = this.props;

    return (
      <div className="block">
        <Title level={2}>{t('HR analysis')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>{ prAvg }</span>
            <span>{t('Average HR')}</span>
          </span>
          <span>
            <span>{ prMax }</span>
            <span>{t('Highest HR')}</span>
          </span>
          <span>
            <span>{ prMin }</span>
            <span>{t('Lowest HR')}</span>
          </span>
        </div>
      </div>
    );
  }
}

PrAbstract.propTypes = {
  prAvg: PropTypes.number.isRequired,
  prMax: PropTypes.number.isRequired,
  prMin: PropTypes.number.isRequired,
};

const mapStateToProps = state => (
  {
    prAvg: state.report.alreadyDecodedData.prAvg,
    prMax: state.report.alreadyDecodedData.prMax,
    prMin: state.report.alreadyDecodedData.prMin,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PrAbstract));
