import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography, Input, Select, DatePicker } from 'antd';
import { withTranslation } from 'react-i18next';
import Creator from '../../../actions/Creator';
import './UserInfo.scss'

const { Title } = Typography;
const { Option } = Select;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
// var male, female, selectedGender

class UserInfo extends Component {

  componentDidMount() {}

  // setGender = ()=>{
  //   const { patientInfo } = this.props
  //   if(localStorage.getItem('language') === "en"){
  //     male = 'M';
  //     female = 'F';
  //     selectedGender = patientInfo.gender?((patientInfo.gender === "男" || patientInfo.gender === "M")?"M":"F"):"--";
  //   }else{
  //     male = '男';
  //     female = '女';
  //     selectedGender = patientInfo.gender?((patientInfo.gender === "男" || patientInfo.gender === "M")?"男":"女"):"--";
  //   }
  // }

  getBMI() {
    const { patientInfo } = this.props;
    const height = patientInfo.height;
    const weight = patientInfo.weight;
    if (weight > 0 && height > 0) {
      const bmi = parseFloat(weight / (height * height) * 10000).toFixed(1);
      return bmi;
    } else {
      return '--'
    }
  }
  handleChange = (e) => {
    var data = {};
    const { handleInputChange } = this.props
    if (typeof e == 'string') {
      data.gender = e;
    } else {
      data = {
        [e.target.name]: e.target.value
      }
    }
    console.log(data);
    handleInputChange(data)
  }
  render() {
    const { t, isEditting, patientInfo } = this.props;
    return (
      <div className="block">
        <Title level={2}>{t('User Info')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data user-table">
          <span>
            <span>
              {isEditting ? <div><Input name="name" style={{ width: '1.5rem'}} value={patientInfo.name} onChange={this.handleChange} /></div> : (patientInfo.name || '--')}
            </span>
            <span>{t('User Name')}</span>
          </span>
          <span>
            <span>
              {isEditting ? <div>
                <Select name="gender" style={{ width:'0.8rem',fontSize:'0.24rem!important' }} showArrow={false} value={patientInfo.gender} onChange={this.handleChange}>
                <Option value="男">男</Option>
                <Option value="女">女</Option>
                </Select>
              </div> : (patientInfo.gender||'--')}
            </span>
            <span>{t('User Gender')}</span>
          </span>
          <span>
            <span>
              {isEditting ?
                <div>
                  <Input name="age" style={{ width: '0.8rem' }} value={patientInfo.age} onChange={this.handleChange}/>
                </div> :
                (patientInfo.age || '--')
              }
            </span>
            <span>{t('User Age')}</span>
          </span>
          <span>
            <span>
              {isEditting ? <div>
                  <Input name="height" style={{ width: '1.2rem' }} value={(patientInfo.height)} onChange={this.handleChange} />
                </div> : (patientInfo.height ? (patientInfo.height + 'cm') : '--')}
            </span>
            <span>{t('User Height')}</span>
          </span>
          <span>
            <span>
              {isEditting ? <div>
                  <Input name="weight" style={{ width: '1.2rem' }} value={patientInfo.weight} onChange={this.handleChange} />
                </div> : (patientInfo.weight ? (patientInfo.weight + 'Kg') : '--')}
            </span>
            <span>{t('User Weight')}</span>
          </span>
          <span>
            <span>{this.getBMI()}</span>
            <span>BMI</span>
          </span>
        </div>
      </div>
    );
  }
}

UserInfo.propTypes = {
  isEditting: PropTypes.bool.isRequired,
  patientInfo: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    isEditting: state.report.isEditting,
    patientInfo: state.report.patientInfo
    
  }
);

const mapDispatchToProps = dispatch => (
  {
    handleInputChange(data){
      dispatch(Creator.handleInputChange({},{},data))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(UserInfo));
