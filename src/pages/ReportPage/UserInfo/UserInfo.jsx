import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography, Input, Select, DatePicker } from 'antd';
import { withTranslation } from 'react-i18next';
import Creator from '../../../actions/Creator';


const { Title } = Typography;
const { Option } = Select;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

class UserInfo extends Component {
  componentDidMount() {

  }

  getBMI() {
    const { edition } = this.props;
    const height = edition.height;
    const weight = edition.weight;
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
    const { t, isEditting, edition } = this.props;
    return (
      <div className="block">
        <Title level={2}>{t('User Info')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>
              {/* { edition.name || '--' } */}
              {isEditting ? <div><Input name="name" style={{ width: 130 }} value={edition.name} onChange={this.handleChange} /></div> : (edition.name || '--')}
            </span>
            <span>{t('User Name')}</span>
          </span>
          <span>
            <span>
              {/* {edition.gender === "M" ? "男" : "女" || '--'} */}
              {isEditting ? <div>
                <Select name="gender" showArrow={false} value={edition.gender === "M" ? "男" : "女" || '--'} style={{ width: 130 }} onChange={this.handleChange}>
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              </div> : (edition.gender === "M" ? "男" : (edition.gender === "F" ? "女" : edition.gender) || '--')}
            </span>
            <span>{t('User Gender')}</span>
          </span>
          <span>
            <span>
              {/* {edition.age || '--'} */}
              {isEditting ?
                <div>
                  <Input name="age" style={{ width: 130 }} value={edition.age} onChange={this.handleChange}/>
                </div> :
                (edition.age || '--')
              }
            </span>
            <span>{t('User Age')}</span>
          </span>
          <span>
            <span>
              {/* {edition.height + 'cm' || '--'} */}
              {isEditting ? <div>
                  <Input name="height" style={{ width: 130 }} value={(edition.height)} onChange={this.handleChange} />
                </div> : (edition.height + 'cm' || '--')}
            </span>
            <span>{t('User Height')}</span>
          </span>
          <span>
            <span>
              {/* {edition.weight + 'Kg' || '--'} */}
              {isEditting ? <div>
                  <Input name="weight" style={{ width: 130 }} value={edition.weight} onChange={this.handleChange} />
                </div> : (edition.weight + 'Kg' || '--')}
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
  edition: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    isEditting: state.report.isEditting,
    edition: state.report.edition
    
  }
);

const mapDispatchToProps = dispatch => (
  {
    handleInputChange(data){
      dispatch(Creator.handleInputChange(data))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(UserInfo));
