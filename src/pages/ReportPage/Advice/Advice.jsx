import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography, Input } from 'antd';
import { withTranslation } from 'react-i18next';
import Creator from '../../../actions/Creator'

import './Advice.scss';

const { Title } = Typography;
const { TextArea } = Input;

class Advice extends Component {
  componentDidMount() {

  }
  handleChange = (e) => {
    var data = {};
    const { handleInputChange } = this.props
    // console.log(e.target.value);
      data = {
        [e.target.name]: e.target.value
    }
    // console.log(data)
    handleInputChange(data)
  }

  render() {
    const { t, adviceData } = this.props;
    return (
      <div className="block">
        <Title level={2}>{t('Sleep Evaluation Recommendations')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="advice">
          <TextArea rows={10} name="ahiAdvice" value={ adviceData.ahiAdvice } onChange={ this.handleChange } />
        </div>
      </div>
    );
  }
}

Advice.propTypes = {
  prAvg: PropTypes.number.isRequired,
  prMax: PropTypes.number.isRequired,
  prMin: PropTypes.number.isRequired,
  edition: PropTypes.object.isRequired,
  adviceData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    prAvg: state.report.alreadyDecodedData.prAvg,
    prMax: state.report.alreadyDecodedData.prMax,
    prMin: state.report.alreadyDecodedData.prMin,
    edition: state.report.edition,
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Advice));
