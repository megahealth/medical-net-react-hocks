import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography } from 'antd';
import { withTranslation } from 'react-i18next';

const { Title } = Typography;


class UserInfo extends Component {
  componentDidMount() {

  }

  getBMI() {
    const { patientInfo } = this.props;
    const height = patientInfo[3];
    const weight = patientInfo[4];
    if(weight>0&&height>0) {
      const bmi = parseFloat(weight / (height * height) * 10000).toFixed(1);
      return bmi;
    }else{
      return '--'
    }
  }

  render() {
    const { patientInfo, t } = this.props;

    return (
      <div className="block">
        <Title level={2}>{t('User Info')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>{ patientInfo[0] || '--' }</span>
            <span>{t('User Name')}</span>
          </span>
          <span>
            <span>{ patientInfo[1] || '--' }</span>
            <span>{t('User Gender')}</span>
          </span>
          <span>
            <span>{ patientInfo[2] || '--' }</span>
            <span>{t('User Age')}</span>
          </span>
          <span>
            <span>{ patientInfo[3] || '--' }</span>
            <span>{t('User Height')}</span>
          </span>
          <span>
            <span>{ patientInfo[4] || '--' }</span>
            <span>{t('User Weight')}</span>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(UserInfo));
