import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography,Input } from 'antd';
import { withTranslation } from 'react-i18next';
import Creator from '../../../actions/Creator';
import './SpoRange.scss';

const { Title } = Typography;


class SpoRange extends Component {
  handleChange = (e) => {
    const { handleInputChange } = this.props;
    var data = {[e.target.name]:e.target.value};
    handleInputChange({
      ...data,
    })
  }
  render() {
    const {
      spo2Less95TimePercent,
      spo2Less90TimePercent,
      spo2Less85TimePercent,
      spo2Less80TimePercent,
      spo2Less95Time,
      spo2Less90Time,
      spo2Less85Time,
      spo2Less80Time,
      isEditting,
      t
    } = this.props;
    return (
      <div className="block">
        <Title level={2}>{t('SpO2')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data stage-table">
          <span>
            <span>{t('SpO2 Range')}</span>
            <span>{t('SpO2 Dur')}</span>
            <span>{t('SpO2 Per')}</span>
          </span>
          <span>
            <span>&lt;95%</span>
            <span className="table-value">
              {
                isEditting?
                  <Input 
                    type="string" 
                    name="spo2Less95Time"
                    value={ spo2Less95Time }
                    onChange={ this.handleChange }
                  />
                : spo2Less95Time
              }
          </span>
            <span className="table-value">
              {
                isEditting?
                  <Input 
                    type="string" 
                    name="spo2Less95TimePercent"
                    value={ spo2Less95TimePercent }
                    onChange={ this.handleChange }
                  />
                :spo2Less95TimePercent
              }
            </span>
          </span>
          <span>
            <span>&lt;90%</span>
            <span className="table-value">
              {
                isEditting?
                  <Input 
                    type="string" 
                    name="spo2Less90Time"
                    value={ spo2Less90Time }
                    onChange={ this.handleChange }
                  />
                :spo2Less90Time
              }
            </span>
            <span className="table-value">
              {
                isEditting?
                  <Input 
                    type="string" 
                    name="spo2Less90TimePercent"
                    value={ spo2Less90TimePercent }
                    onChange={ this.handleChange }
                  />
                :spo2Less90TimePercent
              }
            </span>
          </span>
          <span>
            <span>&lt;85%</span>
            <span className="table-value">
              {
                isEditting?
                  <Input 
                    type="string" 
                    name="spo2Less85Time"
                    value={ spo2Less85Time }
                    onChange={ this.handleChange }
                  />
                :spo2Less85Time
              }
            </span>
            <span className="table-value">
              {
                isEditting?
                  <Input 
                    type="string" 
                    name="spo2Less85TimePercent"
                    value={ spo2Less85TimePercent }
                    onChange={ this.handleChange }
                  />
                :spo2Less85TimePercent
              }
            </span>
          </span>
          <span>
            <span>&lt;80%</span>
            <span className="table-value">
              {
                isEditting?
                  <Input 
                    type="string" 
                    name="spo2Less80Time"
                    value={ spo2Less80Time }
                    onChange={ this.handleChange }
                  />
                :spo2Less80Time
              }
            </span>
            <span className="table-value">
              {
                isEditting?
                  <Input 
                    type="string" 
                    name="spo2Less80TimePercent"
                    value={ spo2Less80TimePercent }
                    onChange={ this.handleChange }
                  />
                :spo2Less80TimePercent
              }
            </span>
          </span>
        </div>
      </div>
    );
  }
}

SpoRange.propTypes = {
  spo2Less95TimePercent: PropTypes.string.isRequired,
  spo2Less90TimePercent: PropTypes.string.isRequired,
  spo2Less85TimePercent: PropTypes.string.isRequired,
  spo2Less80TimePercent: PropTypes.string.isRequired,
  spo2Less95Time: PropTypes.string.isRequired,
  spo2Less90Time: PropTypes.string.isRequired,
  spo2Less85Time: PropTypes.string.isRequired,
  spo2Less80Time: PropTypes.string.isRequired,
  isEditting: PropTypes.bool,
};

const mapStateToProps = state => (
  {
    sleepData: state.report.data.sleepData,
    spo2Less95TimePercent: state.report.adviceData.spo2Less95TimePercent,
    spo2Less90TimePercent: state.report.adviceData.spo2Less90TimePercent,
    spo2Less85TimePercent: state.report.adviceData.spo2Less85TimePercent,
    spo2Less80TimePercent: state.report.adviceData.spo2Less80TimePercent,
    spo2Less95Time: state.report.adviceData.spo2Less95Time,
    spo2Less90Time: state.report.adviceData.spo2Less90Time,
    spo2Less85Time: state.report.adviceData.spo2Less85Time,
    spo2Less80Time: state.report.adviceData.spo2Less80Time,
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SpoRange));
