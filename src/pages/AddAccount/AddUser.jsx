import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Row, Col, Input, Drawer, Form, Select, DatePicker, message, Switch } from 'antd';
import Creator from '../../actions/Creator';

const { Option } = Select;

class AddUserForm extends Component {

  state = {
    isAdding: false,
    visible: false,
  }

  showDrawer = () => {
    this.props.changeAccountModalStatus(true);
  };

  onClose = () => {
    this.props.changeAccountModalStatus(false);
  };

  onFinish = (values) => {
    console.log('Success:', values);
    this.props.addAccount(values)
  };

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  render() {
    const { isAdding } = this.state;
    const visible = this.props.account.visible;

    return (
      <div style={{ display: 'inline-block', marginLeft: '20px' }}>
        <Button type="primary" onClick={this.showDrawer}> 新增用户 </Button>
        <Drawer
          title="创建新用户"
          width={720}
          onClose={this.onClose}
          visible={visible}
        >
          <Form
            layout="vertical"
            name="basic"
            initialValues={{ remember: true }}
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="用户名"
                  name='username'
                  rules={[{ required: true, message: '请填写用户名' }]}
                >
                  <Input placeholder="请填写用户姓名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="呢称"
                  name='name'
                  rules={[{ required: true, message: '请填写昵称' }]}
                >
                  <Input placeholder="请填写中文格式昵称" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="密码"
                  name='password'
                  rules={[{ required: true, message: '请填写密码' }]}
                >
                  <Input placeholder="请填写密码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="权限"
                  name='roleType'
                  rules={[{ required: true, message: '请选择权限' }]}
                >
                  <Select
                    placeholder="选择该账号的权限"
                    allowClear
                  >
                    <Option value="5">5（一级账号）</Option>
                    <Option value="6">6（二级账号）</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="归属机构"
                  name='shortName'
                  rules={[{ required: true, message: '请填归属机构' }]}
                >
                  <Input placeholder="请填归属机构" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item >
              <div
                style={{
                  marginTop: '50px',
                  width: '100%',
                  borderTop: '1px solid #e9e9e9',
                  padding: '10px 16px',
                  background: '#fff',
                  textAlign: 'right',
                }}
              >
                <Button onClick={this.onClose} style={{ marginRight: 8 }}>
                  取消
                </Button>
                <Button loading={isAdding} type="primary" htmlType="submit">
                  确定
                </Button>
              </div>
            </Form.Item>
          </Form>

        </Drawer>
      </div>
    );
  }
}

AddUserForm.propTypes = {
  account: PropTypes.shape({
    visible: PropTypes.bool
  }).isRequired,
  changeAccountModalStatus: PropTypes.func.isRequired,
  addAccount: PropTypes.func.isRequired,
}

const mapStateToProps = state => (
  {
    account: state.account
  }
);

const mapDispatchToProps = dispatch => (
  {
    changeAccountModalStatus(visible) {
      dispatch(Creator.changeAccountModalStatus(visible));
    },
    addAccount(accountData){
      dispatch(Creator.addAccount(accountData))
    }
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(AddUserForm);
