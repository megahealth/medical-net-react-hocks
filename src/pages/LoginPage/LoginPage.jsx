import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import AV from 'leancloud-storage';
import { Toast } from 'antd-mobile';
import { createHashHistory } from 'history';
import ChangeLang from '../../components/ChangeLang/ChangeLang'
import Creator from '../../actions/Creator';
import { withTranslation } from 'react-i18next';

import LOGO from '../../assets/megahealth.png';
import './LoginPage.scss';

class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      showPw: false,
      loading: false,
    };
  }
  componentDidMount(){
    const user = AV.User.current();
    if(user){
      const history = createHashHistory();
      if(user.id === '5b73f33cfe88c2005b88dc8a'){
        history.push('/addaccount');
      }else{
        history.push('/app');
      }
    }
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
    const { t } = this.props;
    
    if (!username) {
      return Toast.info(t('Pls Enter Username'));
    }
    if (!password) {
      return Toast.info(t('Pls Enter Password'));
    }
    this.setState({
      loading:true
    })
    AV.User.logIn(username, password).then(user => {
      // this.state.loading = false
      const history = createHashHistory();
      if(user.id === '5b73f33cfe88c2005b88dc8a'){
        history.push('/addaccount');
      }else{
        history.push('/app');
      }
    }, err => {
      // 登录失败（可能是密码错误）
      let errMsg = t('Login failed');
      switch (err.code) {
        case 210:
          errMsg = t('Username or password mistack');
          break;
        case 211:
          errMsg = t(`User doesn't exist`);
          break;
        default:
          break;
      }
      Toast.fail(errMsg);
    });
  }

  render() {
    const { showPw } = this.state;
    const { t } = this.props;

    return (
      <div className="login-container">
        <div className="login-1">
          <img src={LOGO} alt="" />
        </div>
        {/* <div className='trans-btn'>
          <ChangeLang></ChangeLang>
        </div> */}
        <div className="login-2">
          <div className="form">
            <div>{t('App Title')}</div>
            <div>
              <span></span>
              <input type="text" placeholder={t('Username')} onInput={this.usernameInput.bind(this)} />
            </div>
            <div>
              <span></span>
              <input type={showPw ? 'text' : 'password'} placeholder={t('Password')} onInput={this.passwordInput.bind(this)} />
              <span className={classnames('eye', { show: showPw })} onClick={this.showOrHidePw.bind(this)}></span>
            </div>
            <div>
              {
                this.state.loading?
                <button disabled style={{ backgroundColor:'#999' }}> 登录中... </button>
                :<button onClick={this.login.bind(this)}>{t('Login')}</button>
              }
            </div>
          </div>
        </div>
        <div className="login-3">v0.1.0</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LoginPage));
