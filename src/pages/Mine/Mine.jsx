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
    this.state = {  }
  }
  componentDidMount(){
    const { setHeader } = this.props;
    setHeader('我的')
    console.log(AV.User.current())
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
          AV.User.logOut();
          window.location.hash = '/';
        }
      },
    ]);
  }
  render() { 
    return ( 
      <div className="content-r">
        <div className="content-r-c">
          <div className="mine">
            <div className='mine-info'>
              <label>用户名</label>
              <span>测试01</span>
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
  allReports: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.bool,
    reportsData: PropTypes.array,
    pagination: PropTypes.object,
    filter: PropTypes.object
  }).isRequired,
  getAllReportsData: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  setHeader: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    title: state.header.title,
    allReports: state.allReports
  }
);

const mapDispatchToProps = dispatch => ({
  setHeader(title) {
    dispatch(Creator.setHeader(title));
  },
  getAllReportsData(limit, current, filter) {
    dispatch(Creator.getAllReportsData(limit, current, filter));
  },
  setFilter(filter) {
    dispatch(Creator.setFilter(filter));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Mine);