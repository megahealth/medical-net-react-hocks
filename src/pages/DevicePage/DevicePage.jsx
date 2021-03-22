import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DevicePage.scss';
import { connect } from 'react-redux';
import { createHashHistory } from 'history';
import AV from 'leancloud-storage';
import { Skeleton,Space,Input } from 'antd';
import { Toast, Modal, Button} from 'antd-mobile';
import Creator from '../../actions/Creator';
import { Translation } from 'react-i18next';

import Table from '../../components/Table/Table'

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

  onChangeNicknameBtn = (record)=>{
    // e.stopPropagation();
    // console.log(e,record);
    const user = AV.User.current();
    const roleType = user.attributes.roleType;
    if(roleType == 5){
      this.setState({
        modal:true,
        oldNickname:record.nickName,
        newNickname:'',
        record:record
      })
    }
  }
  changeNickname = (e)=>{
    this.setState({newNickname:e.target.value})
  }
  onOk = ()=>{
    console.log('hhhh',this.state);
    const {record,newNickname} = this.state
    AV.Cloud.run('updateName_User', {"userId": record.userId,"name": newNickname}).then((data)=> {
      Toast.success('修改成功！',3)
      let { allDevice, getAllDevice } = this.props;
      getAllDevice({
        current:1,
        pageSize:10,
        total:0,
      });
      this.setState({
        modal:false,
        newNickname:''
      })
    }, (error)=> {
      console.log(error);
      Toast.fail('修改失败！',3)
    });
    
  }
  componentDidMount() {
    let { allDevice, getAllDevice, setHeader } = this.props;
    getAllDevice({
      current:1,
      pageSize:10,
      total:0,
    });
    setHeader('设备列表');
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
                  type='deviceList'
                  dataSource={deviceList}
                  pagination={pagination}
                  loadMore={res => this.props.getAllDevice({ ...pagination, current:res.current+1 })}
                  btnClick={ device => this.onChangeNicknameBtn(device) }
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
              <label style={{ fontSize:'0.3rem' }}>旧用户昵称</label>
              <Input placeholder="" className="modal_input" disabled value={this.state.oldNickname} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize:'0.3rem' }}>新用户昵称</label>
              <Input placeholder="新用户昵称" className="modal_input" value={this.state.newNickname} 
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
  getAllDevice: PropTypes.func.isRequired,
  setHeader: PropTypes.func.isRequired,
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
    setHeader(title) {
      dispatch(Creator.setHeader(title));
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(DevicePage);
