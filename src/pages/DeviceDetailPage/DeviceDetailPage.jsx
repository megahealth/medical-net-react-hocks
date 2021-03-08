import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DeviceDetailPage.scss';
import { connect } from 'react-redux';
import styleColor from '../../common/styleColor'
import AV from 'leancloud-storage';
import Creator from '../../actions/Creator';
import { Input, Radio, TimePicker  } from 'antd';
import moment from 'moment';
import { Toast, Modal, Button, Switch } from 'antd-mobile';
import { PlusOutlined } from '@ant-design/icons';
import { Translation } from 'react-i18next';
import axios from 'axios';
import img_device from '../../assets/img_device.png'
import ring_icon from '../../assets/ring-icon.png'
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
    this.props.setHeader('当前设备')
  }
  componentWillUnmount() {
    clearInterval(intervalGetRingArr);
  }
  changeLed = (checked) => {
    const led = checked ? -1 : 0;
    this.props.changeLED(led, this.props.deviceDetail.deviceId)
  }
  changeMonitorStart = (time) => {
    this.state.timeStart = time.format('HH:mm');
  }
  changeMonitorEnd = (time) => {
    this.state.timeEnd = time.format('HH:mm');
  }
  changeModel = (e) => {
    const modeType = e ? 1 : 0;
    console.log(modeType);
    const updateDevice = AV.Object.createWithoutData('Device', this.id);
    updateDevice.set('modeType', modeType)
    updateDevice.save().then(res => {
      this.props.changeMonitorAndMode({
        modeType: modeType,
      });
    }).catch(error => {
      console.log(error);
    })
  }
  ringSnSelected = (mac, index, ringArr) => {
    // console.log('xff',mac,index,ringArr);
    let text = '';
    if (ringArr[index].active) {
      Toast.info('该设备已被启用，请勿重复启用！')
    } else {
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
      alert(text, null, [
        { text: 'Cancel', onPress: () => { } },
        { text: 'Ok', onPress: () => { this.changeActiveRing(mac, text); } }
      ])
    }
  }
  changeActiveRing = async (mac, text) => {
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
    return ringArr.map((item, index) => {
      const ringInfo = item;
      return (
        <tr
          key={item.sn} style={styleColor[item.ringStatus]}
          onClick={() => alert(item.sn, null, [
            { text: '启用', onPress: () => this.ringSnSelected(item.mac, index, ringArr) },
            {
              text: '解绑', onPress: () => alert(item.ringStatus == 'background_greed' ? '确定解绑？解绑操作将导致监测中戒指血氧数据丢失！' : '确定解绑？', null, [
                { text: 'Cancel', onPress: () => { } },
                { text: 'Ok', onPress: () => { this.unBindRingV2(item.mac) } }
              ])
            },
            { text: '关闭', onPress: () => { } },
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
          <td>{(ringInfo.monitorDetail == 1 || ringInfo.monitorDetail == 2) ? (ringInfo.monitorDetail == 1 ? '待收取' : '已收取') : '无'}</td>
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
    const { timeStart, timeEnd } = this.state;
    const period = timeStart + '-' + timeEnd
    if (device.period == period) {
      Toast.info('数据未发生变化！', 2)
    } else {
      Toast.info('ok！', 2)
      const updateDevice = AV.Object.createWithoutData('Device', this.id);
      updateDevice.set('period', period)
      updateDevice.save().then(res => {
        this.props.changeMonitorAndMode({
          period:period
        });
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
  addRingBtn = () => {
    alert('绑定戒指', 
    <div>
      <p style={{ textAlign:'left' }}>请按照监护仪语音指令完成绑定</p>
      <p style={{ textAlign:'left' }}>
        1.听到开始绑定戒指指令<br/>
        2.晃动戒值 <br/>
        3.等待绑定成功指令
      </p>
    </div> ,[
      { text: '了解', onPress: () => {} },
      // { text: 'Ok', onPress: () => console.log('ok') },
    ])
  }
  render() {
    const { device, ringArr, roleType } = this.props.deviceDetail;
    console.log(device, ringArr, roleType);
    return (
      <div className="content-r">
        <div className="content-r-c">
          <div className="ipad—device-detail">
            <div className="ipad-device-card">
              <div className='table-device'>
                <div>
                  <img src={img_device} alt="" />
                </div>
                <div className='table-text'>
                  <p>
                    <span>设备状态：</span>
                    <span style={{ color: device.workStatus == '1' ? (device.monitorStatus == 0 ? '#1E58DE' : 'green') : '#FC6063' }}>
                      { device.workStatus == '1' ? (device.monitorStatus == 0 ? '已连接' : '监测中') : '未连接' }
                    </span>
                  </p>
                  <p><span>设备编号：</span><span>{ device.deviceSN }</span></p>
                  <p><span>固件版本：</span><span>{ device.versionNO }</span></p>
                </div>
              </div>
              <div className='card-line'></div>
              <div className='card-contrl'>
                <div className='card-contrl-tr'>
                  <div>
                    <span>监测模式：</span>
                    <span style={{ color:'#4274e2' }}>定时监测</span>
                  </div>
                  <div>
                    <span>呼吸灯开关：</span>
                    <Switch
                      style={{ fontSize:'0.4rem' }}
                      checked={device.ledOnTime == 0 ? false : true} 
                      onChange={this.changeLed}
                      platform="ios"
                    />
                  </div>
                </div>
                <div className='card-contrl-tr'>
                  <div>
                    <span>定时监测：</span>
                    <span style={{ color:'#4274e2' }}  onClick={this.openModel}>{ device.period }</span>
                  </div>
                  <div>
                    <span>儿童模式：</span>
                    <Switch
                      style={{ fontSize:'0.4rem' }}
                      checked={device.modeType == 1 ? true : false} 
                      onChange={this.changeModel}
                      platform="ios"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='ring-list'>
              <p className='ring-list-title'>指环信息</p>
              <ul>
                {
                  ringArr.length>0?
                  ringArr.map((ring,index)=>{
                    return (
                      <li 
                        key={ ring.sn }
                        onClick={() => alert(ring.sn, null, [
                          { text: '启用', onPress: () => this.ringSnSelected(ring.mac, index, ringArr) },
                          {
                            text: '解绑', onPress: () => alert(ring.ringStatus == 'background_greed' ? '确定解绑？解绑操作将导致监测中戒指血氧数据丢失！' : '确定解绑？', null, [
                              { text: 'Cancel', onPress: () => { } },
                              { text: 'Ok', onPress: () => { this.unBindRingV2(ring.mac) } }
                            ])
                          },
                          { text: '关闭', onPress: () => { } },
                        ])}
                      >
                        <img src={ring_icon} />
                        <div className='ringInfo'>
                          <p>{ ring.sn }</p>
                          <p>{ ring.mac } / { ring.swVersion }</p>
                        </div>
                        <div className='ringStatus'>
                          <p>状态：
                            <span style={styleColor[ring.ringStatus]}>
                              { 
                                ring.ringStatus=='background_gry'?'未启用': 
                                ring.ringStatus=='background_blue'?'已连接':
                                ring.ringStatus=='background_red'?'已连接/电量低':
                                ring.ringStatus=='background_yellow'?'未连接':'监测中'
                              }
                            </span>
                          </p>
                          <p>电量：{ ring.battery==-1?'--':ring.battery }%</p>
                        </div>
                      </li>
                    )
                  })
                  :null
                  
                }
              </ul>
            </div>
            <div>
              <div className='add-ring-btn' onClick={ this.addRingBtn }>
                <span>添加指环</span>
              </div>
            </div>
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
              title={<span style={{ fontSize: '0.36rem' }}>{t("Modify the equipment")}</span>}
              footer={[{ text: t('Close'), onPress: () => { this.setState({ modal: false, modeType: null }) } }, { text: t('Submit'), onPress: () => { this.onOk() } }]}
            >
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.3rem',marginBottom: 16 }}>{t('Monitor period')}</label><br /><br />
                <TimePicker
                  allowClear={false}
                  showNow={false}
                  onChange={this.changeMonitorStart}
                  defaultValue={moment(this.state.timeStart, format)}
                  format={format}
                  size="large"
                />
                <label style={{ fontSize: '0.24rem' }}>~</label>
                <TimePicker
                  allowClear={false}
                  showNow={false}
                  onChange={this.changeMonitorEnd}
                  defaultValue={moment(this.state.timeEnd, format)}
                  format={format}
                  size="large"
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
  setHeader: PropTypes.func.isRequired,
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
    },
    setHeader(title) {
      dispatch(Creator.setHeader(title));
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDetailPage);
