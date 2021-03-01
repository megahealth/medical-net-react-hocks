import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DeviceDetailPage.scss';
import { connect } from 'react-redux';
import styleColor from '../../common/styleColor'
import AV from 'leancloud-storage';
import Creator from '../../actions/Creator';
import { Input, Radio, TimePicker } from 'antd';
import moment from 'moment';
import { Toast, Modal, Button, Switch } from 'antd-mobile';
import { PlusOutlined } from '@ant-design/icons';
import { Translation } from 'react-i18next';
import axios from 'axios';
const alert = Modal.alert;
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
    // if (!(navigator.userAgent.match(/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i))) {
    //   clearInterval(intervalGetRingArr);
    // }
  }
  componentWillUnmount() {
    clearInterval(intervalGetRingArr);
  }
  optionsWithDisabled = (t) => {
    return [
      { label: t('Adult'), value: 0 },
      { label: t('Children'), value: 1 },
    ]
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
  ringSnSelected = (mac,index,ringArr) => {
    // console.log('xff',mac,index,ringArr);
    let text = '';
    if(ringArr[index].active){
      Toast.info('该设备已被启用，请勿重复启用！')
    }else{
      if (ringArr.length > 1) {
        for (var i = 0; i < ringArr.length; i++) {
          if (ringArr[i].active == true && ringArr[i].monitorDetail == 1) {
            text = '确定启用？该操作将导致待收血氧数据丢失！'
            i = ringArr.length;
          } else if (ringArr[i].active == true && ringArr[i].ringStatus == 'background_greed') {
            text = '确定启用？该操作将导致监测血氧数据丢失！'
            i = ringArr.length;
          }
          else {
            text = '确定启用该戒指？'
          }
        }
      } else {
        text = '确定启用该戒指？'
      }
      alert(text,null,[
        {text: 'Cancel', onPress: ()=>{ }},
        {text: 'Ok', onPress: ()=>{ this.changeActiveRing(mac, text); }}
      ])
    }
  }
  changeActiveRing = async (mac,text) => {
    const { device } = this.props.deviceDetail;
    const localIP = device.localIP
    var changeRingParam = {
      active: true,
      mac: mac,
      deviceType: 'MegaRing'
    }
    var url = "http://" + localIP + ":8080/updateBoundDevice";
    try {
      Toast.loading('戒指启动中...', 0)
      const res = await axios({
        headers: {
          'Content-Type': 'text/plain'
        },
        method: 'post',
        url: url,
        data: changeRingParam,
      });
      Toast.success('启用设备成功！')
      this.props.getDeviceDetail(this.id);
    } catch (error) {
      console.log(error);
      Toast.fail('启用设备失败！')
    }
    
  }
  unBindRingV2 = async (mac) => {
    const { device } = this.props.deviceDetail;
    const localIP = device.localIP
    var url = "http://" + localIP + ":8080/unbindDevice?type=MegaRing&&mac=" + mac;
    try {
      Toast.loading('戒指解绑中...', 0)
      await axios.get(url);
      Toast.success('启用解绑成功！')
      this.props.getDeviceDetail(this.id);
    } catch (error) {
      console.log(error);
      Toast.fail('启用解绑失败！')
    }
  }
  ringList = (ringArr) => {
    return ringArr.map((item,index) => {
      const ringInfo = item;
      return (
      <tr 
        key={item.sn} style={styleColor[item.ringStatus]} 
        onClick={()=>alert(item.sn,null, [
          { text: '启用', onPress: () => this.ringSnSelected(item.mac,index,ringArr) },
          { text: '解绑', onPress: () => alert(item.ringStatus == 'background_greed'?'确定解绑？解绑操作将导致监测中戒指血氧数据丢失！':'确定解绑？',null,[
            {text: 'Cancel', onPress: ()=>{}},
            {text: 'Ok', onPress: ()=>{ this.unBindRingV2(item.mac) }}
          ]) },
          { text: '关闭', onPress: () => {} },
        ])}>
        <td>{ringInfo.sn}</td>
        <Translation>{t => <td>{t(ringInfo.typeOfSN)}</td>}</Translation>
        <td>{ringInfo.mac}</td>
        {ringInfo.battery == -1
          ?
            <td>----</td>
          :
          <td className="batter-status">
            <span style={ringInfo.battery > 50 ? styleColor.background_greed : (ringInfo.battery >= 25 ? styleColor.background_red : styleColor.background_gry_600)}></span>
            <span style={ringInfo.battery > 50 ? styleColor.background_greed : (ringInfo.battery > 25 ? styleColor.background_red : styleColor.background_gry_600)}></span>
            <span style={ringInfo.battery > 50 ? styleColor.background_greed : styleColor.background_gry_600}></span>
            <span style={ringInfo.battery > 75 ? styleColor.background_greed : styleColor.background_gry_600}></span>
          </td>
        }
        <td>{ (ringInfo.monitorDetail == 1||ringInfo.monitorDetail == 2)?(ringInfo.monitorDetail == 1?'待收取':'已收取'):'无' }</td>
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
      Toast.info('数据未发生变化！', 2)
    } else {
      Toast.info('ok！', 2)
      const updateDevice = AV.Object.createWithoutData('Device', this.id);
      if (device.modeType != modeType) updateDevice.set('modeType', modeType)
      if (device.period != period) updateDevice.set('period', period)
      updateDevice.save().then(res => {
        this.props.changeMonitorAndMode(this.state);
        Toast.success('修改成功！', 1)
        setTimeout(() => {
          this.setState({
            modal: false,
            timeStart: '',
            timeEnd: '',
            modeType: null,
          })
        }, 1000)
      }).catch(error => {
        console.log(error);
        Toast.fail('修改失败！', 1)
      })
    }
  }

  render() {
    const { device, ringArr, roleType } = this.props.deviceDetail;
    return (
      <div className="content-r">
        <div className="device-detail">
          <div className="simple-card">
            <div className="card-title">
              <Translation>{t => <span>{t('Device information')}</span>}</Translation>
              <a style={{ float: 'right', marginRight: '20px' }} onClick={this.openModel}>
                <Translation>{t => <span>{t('Change')}</span>}</Translation>
              </a>
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
        <div className="device-detail">
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
            <div className="ring-status">
              <span>戒指状态：</span>
              <span><i style={{ backgroundColor:'#f8f8f8' }}></i>未启用</span>
              <span><i style={{ backgroundColor:'#ffffac' }}></i>未连接</span>
              <span><i style={{ backgroundColor:'#FF0012' }}></i>已连接(电量低)</span>
              <span><i style={{ backgroundColor:'#d2e2ff' }}></i>已连接</span>
              <span><i style={{ backgroundColor:'#00E700' }}></i>监测中</span>
              {/* <span><i style={{ backgroundColor:'red' }}></i>已连接</span> */}
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
            {/* <Switch size='default' checked={device.ledOnTime == 0 ? false : true} onChange={this.changeLed} style={{ float: 'right' }} /> */}
            <Switch
              style={{ fontSize:'0.3rem' }}
              checked={device.ledOnTime == 0 ? false : true} 
              onChange={this.changeLed}
              platform="ios"
            />
          </div>
        </div>
        <Translation>
          {t =>
              <Modal
                className="modal1"
                visible={this.state.modal}
                transparent
                maskClosable={true}
                onClose={() => this.setState({ modal: false, modeType: null })}
                onOk={() => this.onOk()}
                title={<span style={{ fontSize:'0.24rem' }}>{ t("Modify the equipment") }</span>}
                footer={[{ text: t('Close'), onPress: () => { this.setState({ modal: false, modeType: null }) } }, { text: t('Submit'), onPress: () => { this.onOk() } }]}
              >
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '16px' }}>{t('Monitor period')}</label><br />
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
                  <label style={{ fontSize: '16px' }}>{t('Mode')}</label><br />
                  <Radio.Group
                    size='large'
                    options={this.optionsWithDisabled(t)}
                    onChange={this.changeModel}
                    value={this.state.modeType}
                    optionType="button"
                    buttonStyle="solid"
                  />
                </div>
              </Modal>

          }
        </Translation>
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
