import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AV from 'leancloud-storage';

import Store from './store';

import './common/common.scss';
import 'antd/dist/antd.css';
import 'antd-mobile/dist/antd-mobile.css';

import Layout from './layout';

AV.applicationId = undefined;
AV.init({
  appId: 'F9tyT5VsLXLCAqxKvTHqzmvP-gzGzoHsz',
  appKey: '17eIyz42rRL1YubtKE5MgLHm',
});

ReactDOM.render(
  <Provider store={Store}>
    <Layout></Layout>
  </Provider>,
  document.getElementById('app')
);

