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
  handleChange = (e) => {
    var value = e.target.value.split('.');
    var data = {};
    const { handleInputChange } = this.props;
    if(value.length == 1){
      data = {
        [e.target.name]: value[0]?parseInt(value[0]):null
      }
    }else{
      data = {
        [e.target.name]: parseFloat(e.target.value)
      }
    }
    handleInputChange(data)
  }
  render() {
    const { spo2Avg, spo2Min, diffThdLge3Cnts, diffThdLge3Pr, t, isEditting } = this.props;
    return (
      <div className="block">
        <Title level={2}>{t('Blood oxygen statistics')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>{ spo2Avg&&spo2Avg.toFixed(1) }</span>
            <span>{t('Average SpO2')}</span>
          </span>
          <span>
            {
              isEditting?
                <Input 
                  type="number" 
                  name="spo2Min"
                  value={ spo2Min }
                  onChange={ this.handleChange }
                />
              :<span>{ (spo2Min&&spo2Min.toFixed(1)) ||  '--'}</span>
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
  spo2Avg: PropTypes.number,
  spo2Min: PropTypes.number,
  diffThdLge3Cnts: PropTypes.number,
  diffThdLge3Pr: PropTypes.number,
  isEditting: PropTypes.bool,
  handleInputChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    spo2Avg: state.report.adviceData.spo2Avg,
    spo2Min: state.report.adviceData.spo2Min,
    diffThdLge3Cnts: state.report.alreadyDecodedData.diffThdLge3Cnts,
    diffThdLge3Pr: state.report.alreadyDecodedData.diffThdLge3Pr,
    isEditting: state.report.isEditting,
  }
);

const mapDispatchToProps = dispatch => (
  {
    handleInputChange(data){
      dispatch(Creator.handleInputChange(data,{}))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SpoAbstract));
