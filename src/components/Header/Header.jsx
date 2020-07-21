import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import AV from 'leancloud-storage';

import './Header.scss';
import LOGO from '../../assets/megahealth.png';

class Header extends Component {

  logOut = () => {
    const history = createHashHistory();
    AV.User.logOut();
    history.push('/');
  }

  render() {
    const { title } = this.props;
    const user = AV.User.current();
    const { name } = user.attributes;
    return (
      <div className="header-container">
        <div>
          <img src={LOGO} alt="" />
        </div>
        <div>{ title }</div>
        <div>
          <div onClick={this.logOut}>（{name}）登出</div>
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
