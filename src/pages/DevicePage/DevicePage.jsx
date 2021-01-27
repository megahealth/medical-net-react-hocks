import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DevicePage.scss';
import { connect } from 'react-redux';
import { createHashHistory } from 'history';
import AV from 'leancloud-storage';
import { Table, Skeleton,Space,Input } from 'antd';
import { Toast, Modal} from 'antd-mobile';
import Creator from '../../actions/Creator';
import { Translation } from 'react-i18next';

class DevicePage extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading:false,
      modal:false,
      oldNickname:'',
      newNickname:'',
      record:{},
      allDevice: [],
      pagination: {
        current: 0,
        pageSize: 10,
        total: 0,
      }
    }
    this.columns = [
      {
        title: <Translation>
          {t => <span>{t('SN')}</span>}
        </Translation>,
        dataIndex: 'deviceSN',
        align: 'center'
      },
      {
        title: <Translation>
          {t => <span>{t('Device version')}</span>}
        </Translation>,
        dataIndex: 'versionNO',
        align: 'center'
      },
      {
        title: <Translation>
          {t => <span>{t('Device status')}</span>}
        </Translation>,
        dataIndex: 'status',
        align: 'center',
        render: status => <Translation>
          {t => <span style={{ color: status.color }}>{t(status.str)}</span>}
        </Translation>,
      },
      {
        title: <Translation>
          {t => <span>{t('Monitor period')}</span>}
        </Translation>,
        dataIndex: 'period',
        align: 'center'
      },
      {
        title: <Translation>
          {t => <span>{t('Account name')}</span>}
        </Translation>,
        dataIndex: 'userName',
        align: 'center'
      },
      {
        title: <Translation>
          {t => <span>{t('User nickname')}</span>}
        </Translation>,
        dataIndex: 'nickName',
        align: 'center',
        render: (text, record) => (
          <Space size="middle">
            <a onClick={(e)=>this.onChangeNicknameBtn(e,record)}>{text}</a>
          </Space>
        )
      }
    ];
  }
  
  onChangeNicknameBtn = (e,record)=>{
    e.stopPropagation();
    this.setState({
      modal:true,
      oldNickname:record.nickName,
      record:record
    })
  }
  changeNickname = (e)=>{
    this.setState({newNickname:e.target.value})
  }
  onOk = ()=>{
    AV.Cloud.run('updateName_User', {"userId": this.state.record.userId,"name": this.state.newNickname}).then((data)=> {
      Toast.success('修改成功！',3)
      let { allDevice, getAllDevice } = this.props;
      getAllDevice(allDevice.pagination);
      setTimeout(()=>{
        this.setState({
          modal:false,
          newNickname:''
        })
      },1000)
    }, (error)=> {
      console.log(error);
      Toast.fail('修改失败！',3)
    });
    
  }
  componentDidMount() {
    let { allDevice, getAllDevice } = this.props;
    getAllDevice(allDevice.pagination);
  }
  toDeviceDetail = (id) => {
    const history = createHashHistory();
    history.push(`/app/device/${id}`);
  }
  render() {
    const { loading, pagination, deviceList } = this.props.allDevice;
    return (
      <React.Fragment>
        {
          loading
            ? <div className="content-loading"><Skeleton /></div>
            : <div className="content-r">
              <div className="content-r-c">
                <Table
                  onRow={item => {
                    return { onClick: () => this.toDeviceDetail(item.key) };
                  }}
                  columns={this.columns}
                  dataSource={deviceList}
                  pagination={pagination}
                  onChange={res => this.props.getAllDevice({ ...pagination, current: res.current })}
                ></Table>
              </div>
            </div>
        }
          <Modal
            className="modal1"
            visible={this.state.modal}
            transparent
            maskClosable={true}
            onClose={()=>this.setState({modal:false})}
            onOk = {() => this.onOk() }
            title="修改用户昵称"
            footer={[{ text: '取消', onPress: () => { this.setState({modal:false}) } },{ text: '确定', onPress: () => { this.onOk() } }]}
          >
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize:'16px' }}>旧用户昵称</label>
              <Input placeholder="Please input nickname" className="modal_input" disabled value={this.state.oldNickname} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize:'16px' }}>新用户昵称</label>
              <Input placeholder="Please input nickname" className="modal_input" value={this.state.newNickname} 
                onChange={(e)=>{ this.setState({newNickname:e.target.value})} }
              />
            </div>
          </Modal>
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
    getAllDevice(pagination) {
      dispatch(Creator.getAllDevice(pagination))
    },
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(DevicePage);
