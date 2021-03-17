import './common/common.scss';
import React, { Component } from 'react';
import { Route, Switch, HashRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { connect } from 'react-redux';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import resources from './i18n';

import MyApp from './app'
import LoginPage from './pages/LoginPage/LoginPage';
import ValidReportsPage from './pages/ValidReportsPage/ValidReportsPage';
import ReportPage from './pages/ReportPage/ReportPage';
import AddAccount from './pages/AddAccount/AddAccount';

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {  }
    i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      resources,
      // lng: navigator.language,
      lng: props.locale.locale,

      keySeparator: false, // we do not use keys in form messages.welcome

      interpolation: {
        escapeValue: false // react already safes from xss
      }
    });
  }

  render() {
    const { locale } = this.props;
    return (
      <ConfigProvider locale={locale}>
        <HashRouter>
          <div className="app-container">
            <Switch>
              <Route path="/" exact component={LoginPage}></Route>
              <Route path="/addaccount" exact component={AddAccount}></Route>
              <Route path='/app' component={MyApp}></Route>
              <Route path="/validreports" exact component={ValidReportsPage}></Route>
              <Route path="/report/:id" exact component={ReportPage}></Route>
            </Switch>
          </div>
        </HashRouter>
      </ConfigProvider>
    );
  }
}

const mapStateToProps = state => (
  {
    locale: state.locale
  }
);

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);