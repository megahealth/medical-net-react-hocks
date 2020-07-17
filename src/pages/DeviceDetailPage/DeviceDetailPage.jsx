import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DeviceDetailPage.scss';
import { connect } from 'react-redux';
// import { Redirect } from 'react-router-dom';
// import AV from 'leancloud-storage';
import Creator from '../../actions/Creator';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import SidebarTabs from '../../common/SidebarTabs';

import { Modal } from 'antd-mobile';

class DeviceDetailPage extends Component {
  componentDidMount() {
  }

  logOut() {
    Modal.alert('退出登录', '确定退出登录吗？', [
      {
        text: '取消',
        onPress: () => console.log('cancel')
      },
      {
        text: '退出',
        onPress: () => {
          console.log('ok');
          // AV.User.logOut().then(() => {
          //   window.location.hash = '/';
          // });
          window.location.hash = '/';
        }
      },
    ]);
  }

  render() {
    const data = {

    };
    const reportNum = 10;

    return (
      <div className="container">
        <Header />
        <div className="content">
          <Sidebar tabs={SidebarTabs} />
          <div className="content-r device-detail">
            <div className="simple-card" style={{ padding: '20px 10px' }}>
              <div className="card-title">初筛仪信息</div>
              <table>
                <thead>
                  <tr>
                    <th>设备编号</th>
                    <th>监测时间段</th>
                    <th>类型</th>
                    <th>固件版本</th>
                    <th>wifi</th>
                    <th>状态</th>
                    <th>总报告数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{data.deviceSN}</td>
                    <td>{data.periodStart}{' '}~{' '}{data.periodEnd}</td>
                    <td>{data.modeType}</td>
                    <td>固件版本</td>
                    <td>{data.wifiName}</td>
                    <td>{data.status ? data.status.str:''}</td>
                    <td>{reportNum}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="simple-card" style={{ padding: '20px 10px' }}>
              <div className="card-title">个人信息</div>
              <table>
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>性别</th>
                    <th>年龄</th>
                    <th>身高</th>
                    <th>体重</th>
                    <th>病案号</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>用户</td>
                    <td>男</td>
                    <td>45</td>
                    <td>170</td>
                    <td>70</td>
                    <td>60217074</td>
                    <td>
                      <button className="card-btn">编辑</button>
                      <button className="card-btn">删除</button>
                      <button className="card-btn change-user">更换用户</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="simple-card card-item">备份与恢复</div>
            <div className="simple-card card-item">修改账号密码</div>
            <div className="simple-card card-item">切换账号</div>
            <div className="simple-card card-item log-out" onClick={this.logOut.bind(this)}>退出登录</div>
          </div>
        </div>
      </div>
    );
  }
}

DeviceDetailPage.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDetailPage);
