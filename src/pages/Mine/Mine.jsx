import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import { connect } from 'react-redux';
import Creator from '../../actions/Creator';
import AV from 'leancloud-storage';
import { Button,Modal } from 'antd-mobile';
import './Mine.scss'
class Mine extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      name:''
    }
  }
  componentDidMount(){
    const { setHeader } = this.props;
    const user = AV.User.current();
    setHeader('我的')
    const name = user.get('name')
    this.setState({
      name
    })
  }
  logOut = (t) => {
    Modal.alert('退出登录', "确定要退出登录吗？", [
      {
        text: '取消',
        onPress: () => console.log('cancel')
      },
      {
        text: '确定',
        onPress: () => {
          this.props.clearDeviceList();
          this.props.clearReportList();
          AV.User.logOut();
          window.location.hash = '/';
        }
      },
    ]);
  }
  render() { 
    const { name } = this.state;
    return ( 
      <div className="content-r">
        <div className="content-r-c">
          <div className="mine">
            <div className='mine-info'>
              <label>用户名</label>
              <span>{ name }</span>
            </div>
            <div className='mine-logout'>
              <Button type="warning" onClick={this.logOut}>退出登录</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Mine.propTypes = {
  title: PropTypes.string.isRequired,
  setHeader: PropTypes.func.isRequired,
  clearReportList: PropTypes.func.isRequired,
  clearDeviceList:PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    title: state.header.title
  }
);

const mapDispatchToProps = dispatch => ({
  setHeader(title) {
    dispatch(Creator.setHeader(title));
  },
  clearDeviceList(){
    dispatch(Creator.clearDeviceList());
  },
  clearReportList(){
    dispatch(Creator.clearReportList());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Mine);