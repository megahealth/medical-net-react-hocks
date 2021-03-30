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
  componentWillMount() {
    
  }
  handleChange = (e) => {
    var data = {};
    const { handleInputChange } = this.props;
      data = {
        [e.target.name]: e.target.value
    }
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
      case 0:
        return  '   1,当晚设备所在房间内无人睡眠。'+'\n'+
              '   2,由于修改睡眠时间，造成睡眠监测提前结束。'+'\n'+
              '   3,您的设备摆放位置不准确，需要调整。具体请参照使用说明。';
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
        return '1.结合临床完善相关检查；'+'\n'+
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
    var spo = (adviceData.spo2Avg&&adviceData.spo2Min)?`夜间平均血氧饱和度为${parseFloat(adviceData.spo2Avg).toFixed(1) ||'--'}%，最低血氧饱和度为${parseFloat(adviceData.spo2Min).toFixed(1)||'--'}%`:"";
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
    <div className='sleep-advice'>睡眠分期分析：
      <p>您的总睡眠时间为{adviceData.totalRecordTime||'--'}，睡眠效率(TST/TIB)为{adviceData.sleepEfficiency||'--'}%，其中深睡期占比{adviceData.deepSleepPercent||'--'}%，浅睡期占比{adviceData.lightSleepPercent||'--'}%，快速眼动期占比{adviceData.remSleepPercent||'--'}%。</p>
      睡眠呼吸综述: 
      <p>您的AHI指数为{adviceData.ahi||'--'}，{ breathe?breathe:'' }{ spo }</p>
      
      {(ahiGrade == 0?'经检测,您当前的您当前这份报告被判定为无效报告。出现此现象的原因可能是':'建议：')}
    </div> 
    return sleepAdvice;
  }

  render() {
    const { t, adviceData, isEditting } = this.props;
    const str = this.getSleepAdvice(adviceData);
    return (
      <div className="block">
        <Title level={2}>{t('Sleep Evaluation Recommendations')}</Title>
        <div className="short-line center">
          <span></span>
        </div>
        <div className="advice">
          { str }
          {
            isEditting?
            <TextArea 
              className='focus-border-blue'
              autoSize={{ minRows: 5, maxRows: 40 }} 
              style={{ border:'2px solid #333' }}
              bordered = {true}
              name="ahiAdvice" 
              value={ adviceData.ahiAdvice || this.getAhiAdvice()}
              onChange={ (e)=> { if(isEditting) this.handleChange(e)} } 
            />
            :
            <TextArea 
              autoSize={{ minRows: 5, maxRows: 40 }} 
              bordered = {false}
              name="ahiAdvice" 
              value={ adviceData.ahiAdvice || this.getAhiAdvice()}
            />
          }
          
          <div className='signature'>
            <div>
              <span>签名日期：</span>
              {
                isEditting?
                  <Input 
                    style={{ width:'1.8rem' }} 
                    name="reviewDate" 
                    value={ adviceData.reviewDate }
                    onChange={ this.handleChange } 
                  />
                  :<span>{ adviceData.reviewDate }</span>
              }
              
            </div>
            <div>
              <span>医师签名：</span>
              {
                isEditting?
                  <Input 
                    style={{ width:'1.5rem' }} 
                    name="reviewDoctor"  
                    value={ adviceData.reviewDoctor }
                    onChange={ this.handleChange } 
                  />
                  :<span>{ adviceData.reviewDoctor }</span>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Advice.propTypes = {
  adviceData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  isEditting: PropTypes.bool.isRequired,
};

const mapStateToProps = state => (
  {
    adviceData: state.report.adviceData,
    isEditting: state.report.isEditting,
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
