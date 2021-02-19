import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DeviceDetailPage.scss';
import { connect } from 'react-redux';
import styleColor from '../../common/styleColor'
import AV from 'leancloud-storage';
import Creator from '../../actions/Creator';
import { Button, Switch, Input, Radio, TimePicker } from 'antd';
import moment from 'moment';
import { Toast, Modal } from 'antd-mobile';
import { PlusOutlined } from '@ant-design/icons';
import { Translation } from 'react-i18next';

const optionsWithDisabled = [
  { label: '成人', value: 0 },
  { label: '儿童', value: 1 },
];
const format = 'HH:mm';
var intervalGetRingArr = null;
class DeviceDetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      timeStart: '',
      timeEnd: '',
      modeType: null,
    }
    this.id = props.match.params.id;
  }
  async componentDidMount() {
    this.props.getDeviceDetail(this.id);
    intervalGetRingArr = setInterval(() => {
      this.props.getDeviceDetail(this.id);
    }, 5000);
    if (!(navigator.userAgent.match(/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i))) {
      clearInterval(intervalGetRingArr);
    }
  }
  componentWillUnmount() {
    clearInterval(intervalGetRingArr);
  }
  changeLed = (checked) => {
    const led = checked ? -1 : 0;
    this.props.changeLED(led, this.props.deviceDetail.deviceId)
  }
  changeMonitorStart = (time) => {
    this.state.timeStart = time.format('hh:mm');
  }
  changeMonitorEnd = (time) => {
    this.state.timeEnd = time.format('hh:mm');
  }
  changeModel = (e) => {
    this.setState({
      modeType: e.target.value
    })

  }
  ringList = (ringArr) => {
    return ringArr.map(item => {
      const ringInfo = item;
      return (<tr key={item.sn} style={ringInfo.active ? styleColor.background_blue : styleColor.background_gry}>
        <td>{ringInfo.sn}</td>
        <Translation>{t => <td>{t(ringInfo.typeOfSN)}</td>}</Translation>
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
  openModel = () => {
    const { device } = this.props.deviceDetail;
    const time = device.period && device.period.split('-');
    this.setState({
      modal: true,
      modeType: device.modeType,
      timeStart: time[0],
      timeEnd: time[1],
    })
  }
  onOk = () => {
    // this.props.changeMonitorAndMode(this.state)
    const { device } = this.props.deviceDetail;
    const { modeType, timeStart, timeEnd } = this.state;
    const period = timeStart + '-' + timeEnd
    if (device.modeType == modeType && device.period == period) {
      Toast.info('数据未发生变化！',2)
    } else {
      Toast.info('ok！',2)
      const updateDevice = AV.Object.createWithoutData('Device',this.id);
      if(device.modeType != modeType) updateDevice.set('modeType', modeType)
      if(device.period != period) updateDevice.set('period', period)
      updateDevice.save().then(res => {
        this.props.changeMonitorAndMode(this.state);
        Toast.success('修改成功！',1)
        setTimeout(()=>{
          this.setState({
            modal: false,
            timeStart: '',
            timeEnd: '',
            modeType: null,
          })
        },1000)
      }).catch(error => {
        console.log(error);
        Toast.fail('修改失败！',1)
      })
    }
  }

  render() {
    const { device, ringArr, roleType } = this.props.deviceDetail;
    return (
      <div className="content-r">
        <div className="device-detail">
          <div className="simple-card" style={{ padding: '20px 10px' }}>
            <div className="card-title">
              <Translation>{t => <span>{t('Device information')}</span>}</Translation>
              <a style={{ float: 'right', marginRight: '20px' }} onClick={this.openModel}>修改</a>
            </div>
            <table>
              <thead>
                <tr>
                  <th><Translation>{t => <span>{t('SN')}</span>}</Translation></th>
                  <th><Translation>{t => <span>{t('Monitor period')}</span>}</Translation></th>
                  <th><Translation>{t => <span>{t('Mode')}</span>}</Translation></th>
                  <th><Translation>{t => <span>{t('Firmware version')}</span>}</Translation></th>
                  <th>wifi</th>
                  <th><Translation>{t => <span>{t('Device status')}</span>}</Translation></th>
                  <th><Translation>{t => <span>{t('Number of reports')}</span>}</Translation></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{device.deviceSN}</td>
                  <td>{device.period}</td>
                  <td><Translation>{t => <span>{(device.modeType) == 1 ? t('Children') : t('Adult')}</span>}</Translation></td>
                  <td>{device.versionNO}</td>
                  <td><Translation>{t => <span>{device.workStatus == '1' ? t(device.wifiName) : t('Not connected')}</span>}</Translation></td>
                  <td><Translation>{t => <span>{device.workStatus == '1' ? (device.monitorStatus == 0 ? t('Online') : t('Monitoring')) : t('Not online')}</span>}</Translation></td>
                  <td>{device.count}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="device-page">
          <div className="simple-card">
            <div className="card-title">
              <Translation>{t => <span>{t('Ring information')}</span>}</Translation>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}><Translation>{t => <span>{t('Ring SN')}</span>}</Translation></th>
                  <th style={{ width: '15%' }}><Translation>{t => <span>{t('Model')}</span>}</Translation></th>
                  <th style={{ width: '22%' }}>MAC</th>
                  <th style={{ width: '12%' }}><Translation>{t => <span>{t('Battery')}</span>}</Translation></th>
                  <th style={{ width: '12%' }}><Translation>{t => <span>{t('Data status')}</span>}</Translation></th>
                  <th style={{ width: '17%' }}><Translation>{t => <span>{t('Firmware version')}</span>}</Translation></th>
                </tr>
              </thead>
              <tbody>{this.ringList(ringArr)}</tbody>
            </table>
            <div className="add-ring">
              <Button icon={<PlusOutlined />} size="large"><Translation>{t => <span>{t('Add ring')}</span>}</Translation></Button>
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
            <Translation>{t => <span>{t('Breathing light switch')}</span>}</Translation>
            <Switch size='default' checked={device.ledOnTime == 0 ? false : true} onChange={this.changeLed} style={{ float: 'right' }} />
          </div>
        </div>
        <Modal
          className="modal1"
          visible={this.state.modal}
          transparent
          maskClosable={true}
          onClose={() => this.setState({ modal: false, modeType: null })}
          onOk={() => this.onOk()}
          title="修改设备"
          footer={[{ text: '取消', onPress: () => { this.setState({ modal: false, modeType: null }) } }, { text: '确定', onPress: () => { this.onOk() } }]}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '16px' }}>监测时段</label><br />
            <TimePicker
              allowClear={false}
              showNow={false}
              onChange={this.changeMonitorStart}
              defaultValue={moment(this.state.timeStart, format)}
              format={format}
              size="large"
            />
            <label style={{ fontSize: '16px' }}>~</label>
            <TimePicker
              allowClear={false}
              showNow={false}
              onChange={this.changeMonitorEnd}
              defaultValue={moment(this.state.timeEnd, format)}
              format={format}
              size="large"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '16px' }}>模式</label><br />
            <Radio.Group
              size='large'
              options={optionsWithDisabled}
              onChange={this.changeModel}
              value={this.state.modeType}
              optionType="button"
              buttonStyle="solid"
            />
          </div>
        </Modal>
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
  changeMonitorAndMode: PropTypes.func.isRequired,
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
    changeLED(led, id) {
      dispatch(Creator.changeLED(led, id))
    },
    changeMonitorAndMode(params, id) {
      dispatch(Creator.changeMonitorAndMode(params))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDetailPage);
