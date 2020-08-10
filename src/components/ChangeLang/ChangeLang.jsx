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
  return <div style={style} onClick={()=>i18n.changeLanguage(i18n.language==='en'?'zh-CN':'en')}><TranslationOutlined /></div>
}

export default ChangeLang;