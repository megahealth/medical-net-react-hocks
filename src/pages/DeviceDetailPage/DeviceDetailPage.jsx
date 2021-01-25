import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DeviceDetailPage.scss';
import { connect } from 'react-redux';
import styleColor from '../../common/styleColor'
// import { Redirect } from 'react-router-dom';
import AV from 'leancloud-storage';
import Creator from '../../actions/Creator';
import { Button, Switch } from 'antd';
import { Modal } from 'antd-mobile';

class DeviceDetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceId: '',
      device: {},
      ringArr: [],
      roleType: null
    }
    this.id = props.match.params.id;
  }
  async componentDidMount() {
    this.props.getDeviceDetail(this.id);
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
  changeLed = (checked) => {
    const led = checked ? -1 : 0
    const device = AV.Object.createWithoutData('Device', this.props.deviceDetail.deviceId)
    device.set('ledOnTime', led)
    device.save().then(res => {
      this.props.getDeviceDetail(this.id);
    }).catch(error => {
      console.log(error);
    })

  }
  changeMonitor = (checked) => {
    console.log(`changeMonitor ${checked}`)
  }
  ringList = (ringArr) => {
    return ringArr.map(item => {
      const ringInfo = item.attributes;
      return (<tr key={item.id} style={ringInfo.active ? styleColor.background_blue : styleColor.background_gry}>
        <td>{ringInfo.sn}</td>
        <td>{ringInfo.typeOfSN}</td>
        <td>{ringInfo.mac}</td>
        <td>
          <span style={ringInfo.battery > 50 ? styleColor.background_greed : (ringInfo.battery >= 25 ? styleColor.background_red : styleColor.background_gry_600)}></span>
          <span style={ringInfo.battery > 50 ? styleColor.background_greed : (ringInfo.battery > 25 ? styleColor.background_red : styleColor.background_gry_600)}></span>
          <span style={ringInfo.battery > 50 ? styleColor.background_greed : styleColor.background_gry_600}></span>
          <span style={ringInfo.battery > 75 ? styleColor.background_greed : styleColor.background_gry_600}></span>
        </td>
        <td>待收取</td>
        <td>{ringInfo.swVersion}</td>
      </tr>)
    })
  }

  render() {
    const { device, ringArr } = this.props.deviceDetail;
    return (
      <div className="content-r">
        <div className="device-detail">
          <div className="simple-card" style={{ padding: '20px 10px' }}>
            <div className="card-title">初筛仪信息</div>
            <table>
              <thead>
                <tr>
                  <th>设备编号</th>
                  <th>监测时间段</th>
                  <th>模式</th>
                  <th>固件版本</th>
                  <th>wifi</th>
                  <th>状态</th>
                  <th>总报告数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{device.deviceSN}</td>
                  <td>{device.period}</td>
                  <td>{device.modeType == 1 ? '儿童模式' : '成人模式'}</td>
                  <td>{device.versionNO}</td>
                  <td>{device.workStatus == '1' ? device.wifiName : '未连接'}</td>
                  <td>{device.workStatus == '1' ? (device.monitorStatus == 0 ? '在线' : '监测中') : '未上线'}</td>
                  <td>{device.count}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="device-page">
          <div className="simple-card">
            <div className="card-title">戒指信息</div>
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
              <tbody>{this.ringList(ringArr)}</tbody>
            </table>
            <div className="add-ring">
              <Button icon="plus" size="large">添加戒指</Button>
            </div>
          </div>
        </div>
        {/* <div className="device-detail">
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

            </div>
             */}
        <div className="simple-card">
          <div className="breath-light">
            <span>呼吸灯开关</span>
            <Switch size='default' checked={device.ledOnTime == 0 ? false : true} onChange={this.changeLed} style={{ float: 'right' }} />
          </div>
        </div>
        <div className="simple-card">
          <div className="breath-light">
            <span>定时监测</span>
            <Switch size='default' onChange={this.changeMonitor} style={{ float: 'right' }} />
          </div>
        </div>
        {this.state.roleType == 5 ?
          <div className="simple-card card-item">{'修改账号密码'}</div> : null
        }
        <div className="simple-card card-item log-out" onClick={this.logOut.bind(this)}>退出登录</div>
      </div>

    );
  }
}

DeviceDetailPage.propTypes = {
  deviceDetail: PropTypes.shape({
    deviceId: PropTypes.string,
    device: PropTypes.object,
    ringArr: PropTypes.array
  }).isRequired,
  getDeviceDetail: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    deviceDetail: state.deviceDetail
  }
);

const mapDispatchToProps = dispatch => (
  {
    startAnimation: () => dispatch(Creator.startAnimation()),
    getDeviceDetail(id) {
      dispatch(Creator.getDeviceDetail(id))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDetailPage);
