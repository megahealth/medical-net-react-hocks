import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Typography, Input } from 'antd';
import { withTranslation } from 'react-i18next';
import Creator from '../../../actions/Creator'

import './Advice.scss';

const { Title } = Typography;
const { TextArea } = Input;
var str;
class Advice extends Component {
  componentWillMount() {
    str = '';
    const { adviceData } = this.props;
    str += this.getSleepAdvice(adviceData);
    str += this.getAhiAdvice()
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

  getAhiGrade = (ahi) => {
    var ahiGrade;
    if(ahi){
      if (ahi == -1) {
        ahiGrade = 0;
      } else if (ahi < 5) {
        ahiGrade = 1;
      } else if (ahi >= 5 && ahi < 15) {
        ahiGrade = 2;
      } else if (ahi >= 15 && ahi < 30) {
        ahiGrade = 3;
      } else {
        ahiGrade = 4;
      }
    }
    return ahiGrade;
  }

  getSpoGrade = (spo2Min) => {
    var spoGrade = 0;
    if (spo2Min) {
      if (spo2Min >= 90) {
        spoGrade = 1;
      } else if (spo2Min >= 85 && spo2Min < 90) {
        spoGrade = 2;
      } else if (spo2Min >= 80 && spo2Min < 85) {
        spoGrade = 3;
      } else {
        spoGrade = 4;
      }
    }
    return spoGrade;
  }

  getAhiAdvice = () => {
    const grade = this.getAhiGrade(this.props.adviceData.ahi)
    switch (grade) {
      case 1:
        return  '1.保持良好的生活习惯；'+'\n'+
        '2.适当运动，增强体质；'+'\n'+
        '3.定期进行睡眠监测；';
      case 2:
        return '1.饮食宜清淡，戒烟、戒酒；适当运动，增强体质，控制BMI（身体质量指数）在18.5-24；使用右侧卧位睡姿入眠；慎用或停用镇静、安眠药物；'+'\n'+
        '2.最好连续睡眠监测，留意睡眠呼吸状态的变化趋势；'+'\n'+
        '3.轻度患者，但症状明显（如白天嗜睡、认知障碍、抑郁等），合并或并发心脑血管疾病和糖尿病等，应压力滴定后，进行无创气道正压通气治疗。';
      case 3:
        return '1.饮食宜清淡，戒烟、戒酒；适当运动，增强体质，控制BMI（身体质量指数）在18.5-24；使用右侧卧位睡姿入眠；慎用或停用镇静、安眠药物；'+'\n'+
        '2.耳鼻喉科就诊，了解有无口或咽喉部位解剖学异常，必要时进行鼻咽部CT/MRI了解有无手术指症状；'+'\n'+
        '3.排除上呼吸道病变后，转睡眠呼吸专科就诊，经压力滴定测试后，无论是否手术均建议夜间无创正压通气治疗；'+'\n'+
        '4.最好连续的睡眠监测，治疗3-6月后进行门诊复诊；';
      case 4:
        return '1.结合临床完善相关检查'+'\n'+
        '2.耳鼻喉科就诊，了解有无口部咽喉部位解剖学异常，必要时进行鼻咽部CT/MRI了解有无手术指症状；'+'\n'+
        '3.排除上呼吸道病变后，转睡眠呼吸专科就诊，经压力滴定测试后，无论是否手术均建议夜间无创正压通气治疗；'+'\n'+
        '4.饮食宜清淡，戒烟、戒酒；适当运动，增强体质，控制BMI（身体质量指数）在18.5-24；使用右侧卧位睡姿入眠；慎用或停用镇静、安眠药物；'+'\n'+
        '5.最好连续的睡眠监测，治疗3-6月后进行门诊复诊；';
      default:
        return ''
    }
  }
  getSleepAdvice = (adviceData) => {
    var ahiGrade = this.getAhiGrade(adviceData.ahi);
    var spoGrade = this.getSpoGrade(adviceData.spo2Min);
    var spo = `夜间平均血氧饱和度为${adviceData.spo2Avg||'--'}%，最低血氧饱和度为${adviceData.spo2Min||'--'}%`;
    var breathe = '';
    switch (ahiGrade) {
      case 1:
        breathe = '睡眠呼吸状态正常。';
        break;
      case 2:
        breathe = '符合【轻度】睡眠呼吸暂停低通气综合征的诊断。'
        break;
      case 3:
        breathe = '符合【轻中】睡眠呼吸暂停低通气综合征的诊断。'
        break;
      case 4:
        breathe = '符合【重度】睡眠呼吸暂停低通气综合征的诊断。'
        break;
    }
    switch (spoGrade) {
      case 1:
        spo += '(标准值：> 90%(正常))';
        break;
      case 2:
        spo += '(标准值：85% ~ 90%(轻度))，符合【轻度】低氧血症诊断。'
        break;
      case 3:
        spo += '(标准值：> 80% ~ 85%(中度))，符合【中度】低氧血症诊断。'
        break;
      case 4:
        spo += '(标准值：< 80%(重度))，符合【重度】低氧血症诊断。'
        break;
    }
    const sleepAdvice = 
    `睡眠分期分析：
    您的总睡眠时间为${adviceData.totalRecordTime||'--'}，睡眠效率(TST/TIB)为${adviceData.sleepEfficiency||'--'}%，其中深睡期占比${adviceData.deepSleepPercent||'--'}%，浅睡期占比${adviceData.lightSleepPercent||'--'}%，快速眼动期占比${adviceData.remSleepPercent||'--'}%。`
    +'\n'+
    `睡眠呼吸综述:
    您的AHI指数为${adviceData.ahi||'--'}，${ breathe?breathe+',':'' }${ spo }`
    +'\n'+
    '建议：'+'\n'
    ;
    return sleepAdvice;
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
          <TextArea rows={10} name="ahiAdvice" value={adviceData.ahiAdvice?adviceData.ahiAdvice:str} onChange={ this.handleChange } />
        </div>
      </div>
    );
  }
}

Advice.propTypes = {
  edition: PropTypes.object.isRequired,
  adviceData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
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
