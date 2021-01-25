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
  componentDidMount() {
    let {allDevice, getAllDevice} = this.props;
    getAllDevice(allDevice.pagination);
  }
  toDeviceDetail = (id)=>{
    const history = createHashHistory();
    history.push(`/app/device/${id}`);
  }
  render() {
    const { loading, pagination, deviceList } = this.props.allDevice
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
                dataSource={deviceList}
                pagination={pagination}
                onChange={res => this.props.getAllDevice({...pagination,current:res.current})}
              ></Table>
            </div>
          </div>
        }
      </React.Fragment>
    );
  }
}

DevicePage.propTypes = {
  allDevice: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.bool,
    deviceList: PropTypes.array,
    pagination: PropTypes.object
  }).isRequired,
  getAllDevice: PropTypes.func.isRequired
};

const mapStateToProps = state => (
  {
    allDevice: state.allDevice
  }
);

const mapDispatchToProps = dispatch => (
  {
    getAllDevice(pagination){ 
      dispatch(Creator.getAllDevice(pagination))
    },
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(DevicePage);
