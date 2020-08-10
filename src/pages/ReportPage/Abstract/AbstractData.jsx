import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography } from 'antd';
import { withTranslation } from 'react-i18next';

const { Title } = Typography;

class AbstractData extends Component {

  getAHI() {
    const { AHI } = this.props;
    return AHI.toFixed(1);
  }

  render() {
    const { t } = this.props;

    return (
      <div className="block">
        <Title level={2}>{t('Data Summary')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="table-data">
          <span>
            <span>{ this.getAHI() }</span>
            <span>AHI</span>
          </span>
        </div>
      </div>
    );
  }
}

AbstractData.propTypes = {
  AHI: PropTypes.number.isRequired,
};

const mapStateToProps = state => (
  {
    AHI: state.report.data.AHI,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AbstractData));
