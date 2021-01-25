import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DevicePage.scss';
import { connect } from 'react-redux';
import { createHashHistory } from 'history';
import AV from 'leancloud-storage';
import { Table, Skeleton } from 'antd';
import Creator from '../../actions/Creator';

const columns = [
  {
    title: '设备编号',
    dataIndex: 'deviceSN',
    align: 'center'
  },
  {
    title: '设备版本',
    dataIndex: 'versionNO',
    align: 'center'
  },
  {
    title: '设备状态',
    dataIndex: 'status',
    align: 'center'
  },
  {
    title: '监测时段',
    dataIndex: 'period',
    align: 'center'
  },
  {
    title: '归属账号',
    dataIndex: 'userName',
    align: 'center'
  },
  {
    title: '用户昵称',
    dataIndex: 'nickName',
    align: 'center'
  }
];

class DevicePage extends Component {
  state = {
    loading:true,
    allDevice:[],
    pagination:{
      current:0,
      pageSize:10,
      total:0,
    }
  }
  async componentDidMount() {
    this.getAllDevice(1)
  }
  getAllDevice = async (current)=>{
    const { pageSize } = this.state.pagination;
    const user = AV.User.current();
    const roleType = user.attributes.roleType;
    var DeviceQuery = new AV.Query('Device');
    DeviceQuery.select(["active", "belongTo", "boundDevices", "deviceSN", "idBaseOrg", "idBoundDevice", "idDevice", "idPatient", "isAutoUpdateRing", "isAutoUpdate", "ledOnTime", "localIP", "modeType", "monitorStatus", "order", "period", "rawDataUpload", "reportTitle", "ringRealtime", "ringStatus", "romVersion", "sleepStatus", "status", "versionNO", "workStatus", "wifiName"]);
    DeviceQuery.include("idPatient", "idBoundDevice", "idBaseOrg");
    var innerQuery1 = new AV.Query("BaseOrganizations");
    if (roleType == 5) {
      innerQuery1.equalTo("type", 'ZGSMZX');
      innerQuery1.limit(1000);
      DeviceQuery.matchesQuery('idBaseOrg', innerQuery1);
      const count = await DeviceQuery.count();
      DeviceQuery.addDescending('createdAt');
      DeviceQuery.limit(pageSize);
      DeviceQuery.skip((current-1) * 10);
      var deviceLists = await DeviceQuery.find();
      const deviceList = []
      deviceLists.forEach(item=>{
        const device = item.attributes;
        deviceList.push({
          key:item.id,
          idBaseOrg:device.idBaseOrg.id,
          deviceSN:device.deviceSN,
          versionNO:device.versionNO,
          status:device.status,
          period:device.period,
        })
      })
      this.handleUser(deviceList)
      this.setState({
        // loading:false,
        // allDevice:deviceList,
        pagination:{
          ...this.state.pagination,
          total:count,
          current:current
        }
      })
    }
  }
  handleUser = async (datas) => {
    // 设备归属账号\根据idBaseOrg查询User表中username
    var _UserQuery1 = new AV.Query('_User');
    var orgPointer1 = AV.Object.createWithoutData('BaseOrganizations', datas[0] && datas[0].idBaseOrg || '1');
    _UserQuery1.equalTo('idBaseOrg', orgPointer1);

    var _UserQuery2 = new AV.Query('_User');
    var orgPointer2 = AV.Object.createWithoutData('BaseOrganizations', datas[1] && datas[1].idBaseOrg || '1');
    _UserQuery2.equalTo('idBaseOrg', orgPointer2);

    var _UserQuery3 = new AV.Query('_User');
    var orgPointer3 = AV.Object.createWithoutData('BaseOrganizations', datas[2] && datas[2].idBaseOrg || '1');
    _UserQuery3.equalTo('idBaseOrg', orgPointer3);

    var _UserQuery4 = new AV.Query('_User');
    var orgPointer4 = AV.Object.createWithoutData('BaseOrganizations', datas[3] && datas[3].idBaseOrg || '1');
    _UserQuery4.equalTo('idBaseOrg', orgPointer4);

    var _UserQuery5 = new AV.Query('_User');
    var orgPointer5 = AV.Object.createWithoutData('BaseOrganizations', datas[4] && datas[4].idBaseOrg || '1');
    _UserQuery5.equalTo('idBaseOrg', orgPointer5);

    var _UserQuery6 = new AV.Query('_User');
    var orgPointer6 = AV.Object.createWithoutData('BaseOrganizations', datas[5] && datas[5].idBaseOrg || '1');
    _UserQuery6.equalTo('idBaseOrg', orgPointer6);

    var _UserQuery7 = new AV.Query('_User');
    var orgPointer7 = AV.Object.createWithoutData('BaseOrganizations', datas[6] && datas[6].idBaseOrg || '1');
    _UserQuery7.equalTo('idBaseOrg', orgPointer7);

    var _UserQuery8 = new AV.Query('_User');
    var orgPointer8 = AV.Object.createWithoutData('BaseOrganizations', datas[7] && datas[7].idBaseOrg || '1');
    _UserQuery8.equalTo('idBaseOrg', orgPointer8);

    var _UserQuery9 = new AV.Query('_User');
    var orgPointer9 = AV.Object.createWithoutData('BaseOrganizations', datas[8] && datas[8].idBaseOrg || '1');
    _UserQuery9.equalTo('idBaseOrg', orgPointer9);

    var _UserQuery10 = new AV.Query('_User');
    var orgPointer10 = AV.Object.createWithoutData('BaseOrganizations', datas[9] && datas[9].idBaseOrg || '1');
    _UserQuery10.equalTo('idBaseOrg', orgPointer10);

    var _UserQueryAll = AV.Query.or(_UserQuery1, _UserQuery2, _UserQuery3, _UserQuery4, _UserQuery5, _UserQuery6, _UserQuery7, _UserQuery8, _UserQuery9, _UserQuery10);
    _UserQueryAll.include("idBaseOrg");
    let userRes =  await _UserQueryAll.find();
    for (var i = 0; i < userRes.length; i++) {
      for(var j = 0; j < datas.length; j++){
        if(userRes[i].get('idBaseOrg').id==datas[j].idBaseOrg){
          let userId = userRes[i].id;
          let hotelId = userRes[i].get('idBaseOrg').get('idOrganization');
          let userName = userRes[i].get('username');
          let nickName = userRes[i].get('name');
          datas[j].userId = userId;
          datas[j].hotelId = hotelId;
          datas[j].userName = userName;
          datas[j].nickName = nickName;
        }
      }
    }
    this.setState({
      loading:false,
      allDevice:datas,
    })
  }
  toDeviceDetail = (id)=>{
    const history = createHashHistory();
    history.push(`/app/device/${id}`);
  }
  render() {
    const { loading, allDevice, pagination } = this.state;
    return (
      <React.Fragment>   
        {
          loading
          ? <div className="content-loading"><Skeleton /></div>
          : <div className="content-r">
            <div className="content-r-c">
              <Table
                onRow={item => {
                  return { onClick: ()=>this.toDeviceDetail(item.key) };
                }}
                columns={columns}
                dataSource={allDevice}
                pagination={pagination}
                onChange={res => this.getAllDevice(res.current)}
              ></Table>
            </div>
          </div>
        }
      </React.Fragment>
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
