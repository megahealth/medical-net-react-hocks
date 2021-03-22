import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography, Input } from 'antd';
import { withTranslation } from 'react-i18next';
import Creator from '../../../actions/Creator';

const { Title } = Typography;

class PrAbstract extends Component {

  render() {
    const {
      prAvg,
      prMax,
      prMin,
      t,
      isEditting
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
            {
              isEditting?
              <Input defaultValue={ prMin }/>
              :<span>{ prMin }</span>
            }
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
  isEditting: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    prAvg: state.report.alreadyDecodedData.prAvg,
    prMax: state.report.alreadyDecodedData.prMax,
    prMin: state.report.alreadyDecodedData.prMin,
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PrAbstract));
