import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography, Input } from 'antd';
import { withTranslation } from 'react-i18next';
import Creator from '../../../actions/Creator';
import { Toast } from 'antd-mobile';

const { Title } = Typography;

class PrAbstract extends Component {

  handleChange = (e) => {
    var data = {};
    const { handleInputChange } = this.props;
    data = {
      [e.target.name]: e.target.value?parseInt(e.target.value):null
    }
    handleInputChange(data)
  }

  render() {
    const {
      prAvg,
      prMax,
      prMin,
      t,
      isEditting,
      alreadyDecodedData,
      handleInputChange
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
              <Input 
              value={ prMin }
              name = "prMin"
              onChange={ this.handleChange }
              onBlur={ ()=>{  
                if( prMin<alreadyDecodedData.prMin ) {
                  handleInputChange({ prMin:alreadyDecodedData.prMin })
                  Toast.fail(`最低血氧饱和度不能低于${ alreadyDecodedData.prMin }`)
                }  
              } }
              />
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
  prAvg: PropTypes.number,
  prMax: PropTypes.number,
  prMin: PropTypes.number,
  alreadyDecodedData: PropTypes.object.isRequired,
  isEditting: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    prAvg: state.report.adviceData.prAvg,
    prMax: state.report.adviceData.prMax,
    prMin: state.report.adviceData.prMin,
    isEditting: state.report.isEditting,
    alreadyDecodedData: state.report.alreadyDecodedData,
  }
);

const mapDispatchToProps = dispatch => (
  {
    handleInputChange(data){
      dispatch(Creator.handleInputChange(data,{}))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PrAbstract));
