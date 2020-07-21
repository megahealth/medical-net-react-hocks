import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import AV from 'leancloud-storage';
import { Toast } from 'antd-mobile';
import { createHashHistory } from 'history';
import Creator from '../../actions/Creator';

import LOGO from '../../assets/megahealth.png';
import './LoginPage.scss';

class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      showPw: false
    };
  }

  showOrHidePw() {
    const { showPw } = this.state;
    this.setState({
      showPw: !showPw
    });
  }

  usernameInput(e) {
    this.setState({
      username: e.target.value
    });
  }

  passwordInput(e) {
    this.setState({
      password: e.target.value
    });
  }

  login() {
    const { username, password } = this.state;
    if (!username) {
      return Toast.info('请输入用户名');
    }
    if (!password) {
      return Toast.info('请输入密码');
    }

    AV.User.logIn(username, password).then(user => {
      const history = createHashHistory();
      history.push('/allreports');
    }, err => {
      // 登录失败（可能是密码错误）
      let errMsg = '登录失败';
      switch (err.code) {
        case 210:
          errMsg = '用户名或密码错误';
          break;
        case 211:
          errMsg = '用户名不存在';
          break;
        default:
          break;
      }
      Toast.fail(errMsg);
    });
  }

  render() {
    const { showPw } = this.state;
    return (
      <div className="login-container">
        <div className="login-1">
          <img src={LOGO} alt="" />
        </div>
        <div className="login-2">
          <div className="form">
            <div>兆观呼吸睡眠初筛管理工作站</div>
            <div>
              <span></span>
              <input type="text" placeholder="用户名" onInput={this.usernameInput.bind(this)} />
            </div>
            <div>
              <span></span>
              <input type={showPw ? 'text' : 'password'} placeholder="密码" onInput={this.passwordInput.bind(this)} />
              <span className={classnames('eye', { show: showPw })} onClick={this.showOrHidePw.bind(this)}></span>
            </div>
            <div>
              <button onClick={this.login.bind(this)}>登录</button>
            </div>
          </div>
        </div>
        <div className="login-3">web: 1.7988</div>
      </div>
    );
  }
}

LoginPage.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
