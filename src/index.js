import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import { Provider } from 'react-redux';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Store from './store';
import AV from 'leancloud-storage';
// import 'babel-polyfill';
import './common/common.scss';

import 'antd/dist/antd.css';
import 'antd-mobile/dist/antd-mobile.css';

import LoginPage from './pages/LoginPage/LoginPage';
import AllReportsPage from './pages/AllReportsPage/AllReportsPage';
import ValidReportsPage from './pages/ValidReportsPage/ValidReportsPage';
import DevicePage from './pages/DevicePage/DevicePage';
import DeviceDetailPage from './pages/DeviceDetailPage/DeviceDetailPage';
import ReportPage from './pages/ReportPage/ReportPage';

AV.applicationId = undefined;
AV.init({
  appId: 'YsnQt4b9FQB8hFtb6SUiDoo6-gzGzoHsz',
  appKey: 'DljedxaXayLmjJhodzhqkfGK',
});

const App = () => (
  <div className="app-container">
    <Switch>
      <Route path="/" exact component={LoginPage}></Route>
      <Route path="/allreports" exact component={AllReportsPage}></Route>
      <Route path="/validreports" exact component={ValidReportsPage}></Route>
      <Route path="/device" exact component={DevicePage}></Route>
      <Route path="/devicedetail" exact component={DeviceDetailPage}></Route>
      <Route path="/report/:id" exact component={ReportPage}></Route>
    </Switch>
  </div>
);

ReactDOM.render(
  <Provider store={Store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('app')
);

