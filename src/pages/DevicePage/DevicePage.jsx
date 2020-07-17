import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DevicePage.scss';
import { connect } from 'react-redux';
// import { Redirect } from 'react-router-dom';
// import AV from 'leancloud-storage';
import { Button } from 'antd';
import Creator from '../../actions/Creator';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';

import SidebarTabs from '../../common/SidebarTabs';

class DevicePage extends Component {
  componentDidMount() {
  }

  render() {

    return (
      <div className="container">
        <Header />
        <div className="content">
          <Sidebar tabs={SidebarTabs} />
          <div className="content-r">
            <div className="device-page">
              <div className="simple-card">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>戒指SN</th>
                      <th style={{ width: '15%' }}>型号</th>
                      <th style={{ width: '22%' }}>MAC</th>
                      <th style={{ width: '12%' }}>电量</th>
                      <th style={{ width: '12%' }}>血氧数据</th>
                      <th style={{ width: '17%' }}>固件版本</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#f8f8f8' }}>
                      <td>P11D3190100063</td>
                      <td>金属（18.5）</td>
                      <td>BC:E5:9F:48:83:4C</td>
                      <td className="battery low-battery">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </td>
                      <td>待收取</td>
                      <td>2.0.7622</td>
                    </tr>
                    <tr style={{ background: '#ffffac' }}>
                      <td>P11D3190100063</td>
                      <td>金属（18.5）</td>
                      <td>BC:E5:9F:48:83:4C</td>
                      <td className="battery low-battery">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </td>
                      <td>待收取</td>
                      <td>2.0.7622</td>
                    </tr>
                    <tr style={{ background: '#ffd6d6' }}>
                      <td>P11D3190100063</td>
                      <td>金属（18.5）</td>
                      <td>BC:E5:9F:48:83:4C</td>
                      <td className="battery full-battery">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </td>
                      <td>待收取</td>
                      <td>2.0.7622</td>
                    </tr>
                    <tr style={{ background: '#d2e2ff' }}>
                      <td>P11D3190100063</td>
                      <td>金属（18.5）</td>
                      <td>BC:E5:9F:48:83:4C</td>
                      <td className="battery full-battery">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </td>
                      <td>待收取</td>
                      <td>2.0.7622</td>
                    </tr>
                  </tbody>
                </table>
                <div className="add-ring">
                  <Button icon="plus" size="large">添加戒指</Button>
                </div>
                <div className="ring-status">
                  <span>戒指状态：</span>
                  <i></i>
                  <span>未使用</span>
                  <i></i>
                  <span>未连接</span>
                  <i></i>
                  <span>已连接（电量低）</span>
                  <i></i>
                  <span>已连接</span>
                  <i></i>
                  <span>监测中</span>
                </div>
              </div>
              <div className="simple-card">
                <div className="breath-light">
                  <span>呼吸灯开关</span>
                </div>
              </div>
              <div className="simple-card">
                <div className="breath-light">
                  <span>定时监测</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

DevicePage.propTypes = {
  home: PropTypes.shape({
    isFetching: PropTypes.bool,
    success: PropTypes.bool,
    animation: PropTypes.bool
  }).isRequired,
  startAnimation: PropTypes.func.isRequired
};

const mapStateToProps = state => (
  {
    home: state.home
  }
);

const mapDispatchToProps = dispatch => (
  {
    startAnimation: () => dispatch(Creator.startAnimation())
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(DevicePage);
