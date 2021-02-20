import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import { connect } from 'react-redux';
import Creator from '../../actions/Creator';
import AV from 'leancloud-storage';
import './AddAccount.scss';
import '../../common/common.scss';
import Header from '../../components/Header/Header';
import AddUser from './AddUser'
import { Table, Button, Row, Col, Input, Form, Select, Popconfirm } from 'antd';
import Item from 'antd/lib/list/Item';

class AddAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      loading: false,
      pagination: {
        pageSize:10,
        current:1,
        total:50
      }
    }
  }
  componentDidMount(){
    const { searchName, pagination } = this.props.account;
    this.props.getAccountList(pagination, searchName)
  }
  usernameChange = e => {
    this.setState({
      username: e.target.value
    })
  }
  getList = (list) => {
    let data = [];
    list.forEach((items,index) => {
      const item = items.attributes;
      data.push({
        index: index,
        id: items.id,
        username: item.username,
        name: item.name,
        roleType: item.roleType,
        shortname: item.inHotel,
        baseOrgId: item.idBaseOrg.id,
      })
    });
    return data
  }
  onPageChange = e => {
    const { searchName } = this.props.account;
    this.props.getAccountList(e, searchName)
  }
  goSearch = ()=>{
    const { pagination } = this.props.account;
    this.props.getAccountList(pagination, this.state.username)
  }
  render() {
    const { pagination, tableLoading, list } = this.props.account;
    const pager = { ...pagination };
    const { username } = this.state;
    pager.showTotal = (total) => {
      return `共 ${total} 条`;
    };
    const data = this.getList(list)
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
      },
      {
        title: '用户名',
        dataIndex: 'username',
        key: 'name',
      },
      {
        title: '昵称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '权限',
        key: 'roleType',
        render: text => text.roleType == 6 ? <span>6(二级账号)</span> : <span>5(一级账号)</span> 
      },
      {
        title: '归属机构',
        dataIndex: 'shortname',
        key: 'shortname',
      },
      {
        title: '添加设备',
        key: 'device',
        render: text => (
          <Button type='primary'>添加</Button>
          // <WrappedEditUserForm id={text.id} />
          // <Button type="primary" onClick={this.showDrawer}>
          //   编辑
          // </Button>
        ),
      },
      // {
      //   title: '编辑',
      //   key: 'edit',
      //   render: text => (
      //     <WrappedEditUserForm id={text.id} />
      //     // <Button type="primary" onClick={this.showDrawer}>
      //     //   编辑
      //     // </Button>
      //   ),
      // },
      // {
      //   title: '删除',
      //   key: 'delete',
      //   render: text => (
      //     <Popconfirm
      //       title="确定删除此用户?"
      //       onConfirm={this.confirm.bind(this, text)}
      //       onCancel={this.cancel.bind(this)}
      //       okText="是"
      //       cancelText="否"
      //     >
      //       {
      //         !text.haveUser && <a href="#">删除</a>
      //       }
      //     </Popconfirm>
      //   ),
      // },
    ];
    return (
      <div className="container">
        <Header />
        <div className="content">
          <div className="list-box">
            <div className="flex-between">
              <div>
                <label style={{ fontSize: '12px' }}>用户名</label>
                <Input value={this.state.username} onChange={this.usernameChange}></Input>
              </div>
              <div style={{ width: '200px' }}>
                <div className="flex-between">
                  <Button onClick={this.goSearch}>搜索</Button>
                  <AddUser></AddUser>
                </div>
              </div>
            </div>
            <div className='list-content'>
              <Table columns={columns} dataSource={data} rowKey="index" onChange={this.onPageChange} pagination={pager} loading={tableLoading} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AddAccount.propTypes = {
  account: PropTypes.shape({
    searchName: PropTypes.string,
    list: PropTypes.array,
    tableLoading: PropTypes.bool,
    pagination: PropTypes.object,
  }).isRequired,
  getAccountList: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    account: state.account
  }
);

const mapDispatchToProps = dispatch => ({
  getAccountList(pagination, searchName){
    dispatch(Creator.getAccountList(pagination, searchName))
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AddAccount);