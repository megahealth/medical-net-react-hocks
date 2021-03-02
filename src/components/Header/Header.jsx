import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import AV from 'leancloud-storage';
import { Translation } from 'react-i18next';
import ChangeLang from '../ChangeLang/ChangeLang'
import { Modal } from 'antd-mobile';
import './Header.scss';
import LOGO from '../../assets/megahealth.png';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      routePath:''
    }
  }
  componentDidMount(){
    console.log(window.location.hash);
    this.setState({
      routePath:window.location.hash,
    })
  }
  logOut = (t) => {
    Modal.alert(t('Log out'), t("Are you sure to log out?"), [
      {
        text: t('NO'),
        onPress: () => console.log('cancel')
      },
      {
        text: t('YES'),
        onPress: () => {
          AV.User.logOut();
          window.location.hash = '/';
        }
      },
    ]);
  }
  render() {
    const user = AV.User.current();
    const { name } = user.attributes;
    const { routePath } = this.state;
    return (
      <div className="header-container-1" >
        <div className='header-cont'>
          <span>筛选</span>
          <span className='header-title'>报告</span>
          <span>刷新</span>
        </div>
      </div>
    );
  }
}

// Header.propTypes = {
//   title: PropTypes.string
// };

// Header.defaultProps = {
//   title: '兆观呼吸睡眠初筛管理工作站'
// };

export default Header;
