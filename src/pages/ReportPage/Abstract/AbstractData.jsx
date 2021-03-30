import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography,Input } from 'antd';
import { withTranslation } from 'react-i18next';
import './AbstractData.scss'
import Creator from '../../../actions/Creator';
import { Toast } from 'antd-mobile';

const { Title } = Typography;

class AbstractData extends Component {

  getAHI() {
    const { adviceData } = this.props;
    var ahi = parseFloat(adviceData.ahi)
    return ahi.toString();
  }

  handleChange = (e) => {
    var data = {};
    const { handleInputChange } = this.props;
      data = {
        [e.target.name]: e.target.value
    }
    handleInputChange(data)
  }

  render() {
    const { t, isEditting,handleInputChange,AHI } = this.props;

    return (
      <div className="block">
        <Title level={2}>{t('Data Summary')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span style={{ width: '500px' }}>
          {/* <span>{this.getAHI()}</span> */}
            {
              isEditting?
                <Input 
                  type="number"
                  style={{ width: '200px' }}
                  name='ahi'
                  value = { this.getAHI() }
                  onBlur = { ()=>{ 
                    if(this.getAHI() == 'NaN'){
                      handleInputChange({ahi:AHI})
                      Toast.fail('AHI值不能为空');
                    } 
                  } }
                  onChange = { this.handleChange }
                />
              :<span>{this.getAHI()}</span>
            }
            <span>AHI</span>
          </span>
          <span>
            <ul className="ahi">
              <li className="first">
                {this.getAHI() <= 5 && this.getAHI() != -1 ? <img src={require('../../../assets/blue.png')} /> : null}
                <div>{'A≤5'}</div> <div>正常</div>
              </li>
              <li className="second">
                {this.getAHI() > 5 && this.getAHI() <= 15 ? <img src={require('../../../assets/green.png')} /> : null}
                <div>{'5<A≤15'}</div> <div>轻度</div>
              </li>
              <li className="third">
                {this.getAHI() > 15 && this.getAHI() <= 30 ? <img src={require('../../../assets/orange.png')} /> : null}
                <div>{'15<A≤30'}</div> <div>中度</div>
              </li>
              <li className="forth">
                {this.getAHI() > 30 ? <img src={require('../../../assets/red.png')} /> : null}
                <div>{'30>A'} </div>
                <div>重度</div>
              </li>
            </ul>
          </span>
        </div>
      </div>
    );
  }
}

AbstractData.propTypes = {
  AHI: PropTypes.number.isRequired,
  isEditting: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  adviceData: PropTypes.object.isRequired,
};

const mapStateToProps = state => (
  {
    AHI: state.report.data.AHI,
    isEditting: state.report.isEditting,
    adviceData: state.report.adviceData,
  }
);

const mapDispatchToProps = dispatch => (
  {
    handleInputChange(data){
      dispatch(Creator.handleInputChange(data,{}))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AbstractData));
