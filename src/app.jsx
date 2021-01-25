import './common/common.scss';
import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Header from './components/Header/Header';
// import TransComponent from './TransComponent'
import Sidebar from './components/Sidebar/Sidebar';
import SidebarTabs from './common/SidebarTabs';
import AllReportsPage from './pages/AllReportsPage/AllReportsPage';
import DeviceDetailPage from './pages/DeviceDetailPage/DeviceDetailPage';
import Device from './pages/DevicePage/DevicePage'

class MyApp extends Component {
  constructor(props) {
    super(props);
    this.state = {  }
  }
  render() { 
    return (   
    <div className="container">
      <Header />
      <div className="content">
        <Sidebar tabs={SidebarTabs} />
        <Switch>
          <Route path="/app/allreports" exact component={AllReportsPage}></Route>
          <Route path="/app/devicedetail" exact component={DeviceDetailPage}></Route>
          <Route path="/app/device/:id" exact component={DeviceDetailPage}></Route>
          <Route path="/app/device" exact component={Device}></Route>
          <Redirect to="/app/allreports"/>
        </Switch>
      </div>
    </div>
  );
  }
}

export default MyApp;