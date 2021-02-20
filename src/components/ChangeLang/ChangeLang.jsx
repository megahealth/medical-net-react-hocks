import React from 'react';
import {
  TranslationOutlined
} from '@ant-design/icons';
// the hook
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Creator from '../../actions/Creator';

const style={
  padding: '0 20px'
}

function ChangeLang (props) {
  const { i18n } = useTranslation();
  const { setLocale, locale } = props;

  return <div style={style} 
    onClick={ () => {
      const reduxLng = locale.locale === 'en' ? 'zh-cn' : 'en';
      const i18nLng = locale.locale === 'en' ? 'zh-CN' : 'en';
    
      localStorage.setItem('language',reduxLng) // 防止刷新更改redux状态
      i18n.changeLanguage(i18nLng) // 改全局自定义文字
      setLocale(reduxLng); // 改组件内文字
    } }
    >
    <TranslationOutlined />
  </div>
}

// i18n   en / zh-CN
// antd    enUS / zhCN   locale: en / zh-cn
// redux    locale: enUS / zhCN   locale.locale: en / zh-cn


const mapStateToProps = state => (
  {
    locale: state.locale
  }
);

const mapDispatchToProps = dispatch => ({
  setLocale(language) {
    dispatch(Creator.setLocale(language));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangeLang);