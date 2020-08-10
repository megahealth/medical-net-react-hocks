import React from 'react';

// the hook
import { useTranslation, Trans } from 'react-i18next';

function TransComponent () {
  const { t, i18n } = useTranslation();
  return <h1><Trans>Welcome to React</Trans></h1>
}

export default TransComponent;