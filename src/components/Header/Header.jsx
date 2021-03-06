import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import AV from 'leancloud-storage';
import { Translation } from 'react-i18next';
import ChangeLang from '../ChangeLang/ChangeLang'

import './Header.scss';
import LOGO from '../../assets/megahealth.png';

class Header extends Component {

  logOut = () => {
    const history = createHashHistory();
    AV.User.logOut();
    history.push('/');
  }

  render() {
    const user = AV.User.current();
    const { name } = user.attributes;
    return (
      <div className="header-container">
        <div>
          <img src={LOGO} alt="" />
        </div>
        <Translation>
          {
            t => <div>{t('App Title')}</div>
          }
        </Translation>    
        <div>
          <Translation>
            {
              t => <div onClick={this.logOut}>（{name}）{t('Log Out')}</div>
            }
          </Translation>
          <ChangeLang></ChangeLang>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  title: PropTypes.string
};

Header.defaultProps = {
  title: '兆观呼吸睡眠初筛管理工作站'
};

export default Header;
