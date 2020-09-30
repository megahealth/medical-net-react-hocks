import React from 'react';
import {
  TranslationOutlined
} from '@ant-design/icons';
// the hook
import { useTranslation } from 'react-i18next';

const style={
  padding: '0 20px'
}

function ChangeLang () {
  const { i18n } = useTranslation();
  return <div style={style} onClick={()=>btnChangelang(i18n)}><TranslationOutlined /></div>
}
// 解决选择语言后，刷新会重置为英文
function btnChangelang(i18n) {
  const language = i18n.language==='en'?'zh-CN':'en';
  localStorage.setItem('language',language)
  i18n.changeLanguage(language)
}
export default ChangeLang;