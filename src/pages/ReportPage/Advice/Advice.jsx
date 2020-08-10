import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography, Input } from 'antd';
import { withTranslation } from 'react-i18next';
import './Advice.scss';

const { Title } = Typography;
const { TextArea } = Input;

class Advice extends Component {
  componentDidMount() {

  }

  render() {
    const { t } = this.props;

    return (
      <div className="block">
        <Title level={2}>{t('Sleep Evaluation Recommendations')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="advice">
          <TextArea rows={10} />
        </div>
      </div>
    );
  }
}

Advice.propTypes = {
  prAvg: PropTypes.number.isRequired,
  prMax: PropTypes.number.isRequired,
  prMin: PropTypes.number.isRequired,
};

const mapStateToProps = state => (
  {
    prAvg: state.report.alreadyDecodedData.prAvg,
    prMax: state.report.alreadyDecodedData.prMax,
    prMin: state.report.alreadyDecodedData.prMin,
  }
);

const mapDispatchToProps = dispatch => (
  {

  }
);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Advice));
