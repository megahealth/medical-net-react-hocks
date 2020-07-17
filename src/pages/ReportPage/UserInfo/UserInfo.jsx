import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography } from 'antd';
// import Creator from '../../../actions/Creator';
// import '../../ReportPage.scss';

const { Title } = Typography;


class UserInfo extends Component {
  componentDidMount() {

  }

  getBMI() {
    const { patientInfo } = this.props;
    const height = patientInfo[3];
    const weight = patientInfo[4];
    const bmi = parseFloat(weight / (height * height) * 10000).toFixed(1);
    return bmi;
  }

  render() {
    const { patientInfo } = this.props;

    return (
      <div className="block">
        <Title level={2}>用户信息</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>{ patientInfo[0] }</span>
            <span>姓名</span>
          </span>
          <span>
            <span>{ patientInfo[1] }</span>
            <span>性别</span>
          </span>
          <span>
            <span>{ patientInfo[2] }</span>
            <span>年龄（岁）</span>
          </span>
          <span>
            <span>{ patientInfo[3] }</span>
            <span>身高（cm）</span>
          </span>
          <span>
            <span>{ patientInfo[4] }</span>
            <span>体重（kg）</span>
          </span>
          <span>
            <span>{ this.getBMI() }</span>
            <span>BMI</span>
          </span>
        </div>
      </div>
    );
  }
}

UserInfo.propTypes = {
  patientInfo: PropTypes.array.isRequired,
};

const mapStateToProps = state => (
  {
    patientInfo: state.report.data.patientInfo,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(UserInfo);
