import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DeviceDetailPage.scss';
import { connect } from 'react-redux';
import styleColor from '../../common/styleColor'
// import { Redirect } from 'react-router-dom';
import AV from 'leancloud-storage';
import Creator from '../../actions/Creator';
import { Button, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Modal } from 'antd-mobile';
import { Translation } from 'react-i18next';

class DeviceDetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {}
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
    const led = checked ? -1 : 0;
    this.props.changeLED(led, this.props.deviceDetail.deviceId)
  }
  changeMonitor = (checked) => {
    console.log(`changeMonitor ${checked}`)
  }
  ringList = (ringArr) => {
    return ringArr.map(item => {
      const ringInfo = item.attributes;
      return (<tr key={item.id} style={ringInfo.active ? styleColor.background_blue : styleColor.background_gry}>
        <td>{ringInfo.sn}</td>
        <Translation>{ t => <td>{t(ringInfo.typeOfSN)}</td> }</Translation>
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
    const { device, ringArr, roleType } = this.props.deviceDetail;
    return (
      <div className="content-r">
        <div className="device-detail">
          <div className="simple-card" style={{ padding: '20px 10px' }}>
            <div className="card-title">
              <Translation>{ t => <span>{t('Device information')}</span> }</Translation>
            </div>
            <table>
              <thead>
                <tr>
                  <th><Translation>{ t => <span>{t('SN')}</span> }</Translation></th>
                  <th><Translation>{ t => <span>{t('Monitor period')}</span> }</Translation></th>
                  <th><Translation>{ t => <span>{t('Mode')}</span> }</Translation></th>
                  <th><Translation>{ t => <span>{t('Firmware version')}</span> }</Translation></th>
                  <th>wifi</th>
                  <th><Translation>{ t => <span>{t('Device status')}</span> }</Translation></th>
                  <th><Translation>{ t => <span>{t('Number of reports')}</span> }</Translation></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{device.deviceSN}</td>
                  <td>{device.period}</td>
                  <td><Translation>{ t => <span>{device.modeType == 1 ? t('Children') : t('Adult')}</span> }</Translation></td>
                  <td>{device.versionNO}</td>
                  <td><Translation>{ t => <span>{device.workStatus == '1' ? t(device.wifiName) : t('Not connected')}</span> }</Translation></td>
                  <td><Translation>{ t => <span>{device.workStatus == '1' ? (device.monitorStatus == 0 ? t('Online') : t('Monitoring')) : t('Not online')}</span> }</Translation></td>
                  <td>{device.count}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="device-page">
          <div className="simple-card">
            <div className="card-title">
              <Translation>{ t => <span>{t('Ring information')}</span> }</Translation>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}><Translation>{ t => <span>{t('Ring SN')}</span> }</Translation></th>
                  <th style={{ width: '15%' }}><Translation>{ t => <span>{t('Model')}</span> }</Translation></th>
                  <th style={{ width: '22%' }}>MAC</th>
                  <th style={{ width: '12%' }}><Translation>{ t => <span>{t('Battery')}</span> }</Translation></th>
                  <th style={{ width: '12%' }}><Translation>{ t => <span>{t('Data status')}</span> }</Translation></th>
                  <th style={{ width: '17%' }}><Translation>{ t => <span>{t('Firmware version')}</span> }</Translation></th>
                </tr>
              </thead>
              <tbody>{this.ringList(ringArr)}</tbody>
            </table>
            <div className="add-ring">
              <Button icon={<PlusOutlined />} size="large"><Translation>{ t => <span>{t('Add ring')}</span> }</Translation></Button>
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
            <Translation>{ t => <span>{t('Breathing light switch')}</span> }</Translation>
            <Switch size='default' checked={device.ledOnTime == 0 ? false : true} onChange={this.changeLed} style={{ float: 'right' }} />
          </div>
        </div>
        <div className="simple-card">
          <div className="breath-light">
            <Translation>{ t => <span>{t('Monitoring switch')}</span> }</Translation>
            <Switch size='default' onChange={this.changeMonitor} style={{ float: 'right' }} />
          </div>
        </div>
        {roleType == 5 ?
          <div className="simple-card card-item">
            <Translation>{ t => <span>{t('Change Password')}</span> }</Translation>
          </div> : null
        }
        <div className="simple-card card-item log-out" onClick={this.logOut.bind(this)}>
          <Translation>{ t => <span>{t('Log out')}</span> }</Translation>
        </div>
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
  changeLED: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    deviceDetail: state.deviceDetail
  }
);

const mapDispatchToProps = dispatch => (
  {
    getDeviceDetail(id) {
      dispatch(Creator.getDeviceDetail(id))
    },
    changeLED(led,id){
      dispatch(Creator.changeLED(led,id))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDetailPage);
