import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography,Input } from 'antd';
import { withTranslation } from 'react-i18next';
import Creator from '../../../actions/Creator';
import { Toast } from 'antd-mobile';

const { Title } = Typography;

class SpoAbstract extends Component {
  componentDidMount() {

  }
  handleChange = (e) => {
    var value = e.target.value.split('.');
    var data = {};
    const { handleInputChange,spoArr,sleepData } = this.props;
    if(value.length == 1){
      data = {
        [e.target.name]: value[0]?parseInt(value[0]):null
      }
    }else{
      data = {
        [e.target.name]: parseFloat(e.target.value)
      }
    }
    let spo2Less95Time,spo2Less90Time,spo2Less85Time,spo2Less80Time,spo2Less95TimePercent,spo2Less90TimePercent,spo2Less85TimePercent,spo2Less80TimePercent,total;
    spo2Less95Time=spo2Less90Time=spo2Less85Time=spo2Less80Time=spo2Less95TimePercent=spo2Less90TimePercent=spo2Less85TimePercent=spo2Less80TimePercent=total=0;
    for (let i = 0; i < sleepData.length; i++) {
      if(sleepData[i]<=4 && sleepData[i]>=2){
        for (let j = 0; j < 60; j++) {
          let item = spoArr[i*60+j];
          total++;
          if(item<data.spo2Min){
            item = data.spo2Min
          }
          if(item < 95) spo2Less95Time++;
          if(item < 90) spo2Less90Time++;
          if(item < 85) spo2Less85Time++;
          if(item < 80) spo2Less80Time++;
        }
      }
    }
    spo2Less95TimePercent = parseFloat((spo2Less95Time*100/total).toFixed(1));
    spo2Less90TimePercent = parseFloat((spo2Less90Time*100/total).toFixed(1));
    spo2Less85TimePercent = parseFloat((spo2Less85Time*100/total).toFixed(1));
    spo2Less80TimePercent = parseFloat((spo2Less80Time*100/total).toFixed(1));
    handleInputChange({
      ...data,
      spo2Less95TimePercent,
      spo2Less90TimePercent,
      spo2Less85TimePercent,
      spo2Less80TimePercent,
      spo2Less95Time,
      spo2Less90Time,
      spo2Less85Time,
      spo2Less80Time,
    })
  }
  render() {
    const { spo2Avg, spo2Min, diffThdLge3Cnts, diffThdLge3Pr, t, isEditting, alreadyDecodedData, handleInputChange } = this.props;
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
                  onBlur={ ()=>{ 
                    if( spo2Min<alreadyDecodedData.Spo2Min.toFixed(1) ){
                      const originalSpo2Min = parseFloat(alreadyDecodedData.Spo2Min.toFixed(1))
                      handleInputChange({ spo2Min:originalSpo2Min })
                      Toast.fail(`最低血氧饱和度不能低于${ originalSpo2Min }`)
                    } 
                  } }
                />
              :<span>{ spo2Min || '--'}</span>
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
  spoArr: PropTypes.array.isRequired,
  sleepData: PropTypes.array.isRequired,
  alreadyDecodedData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    spo2Avg: state.report.adviceData.spo2Avg,
    spo2Min: state.report.adviceData.spo2Min,
    diffThdLge3Cnts: state.report.alreadyDecodedData.diffThdLge3Cnts,
    diffThdLge3Pr: state.report.alreadyDecodedData.diffThdLge3Pr,
    isEditting: state.report.isEditting,
    alreadyDecodedData: state.report.alreadyDecodedData,
    spoArr: state.report.alreadyDecodedData.Spo2Arr,
    sleepData: state.report.data.sleepData,
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
