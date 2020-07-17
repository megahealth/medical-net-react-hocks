import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Header.scss';
// import { Icon } from '@ant-design/compatible';
import { SmileOutlined } from '@ant-design/icons';
// import { Link } from 'react-router-dom';

import LOGO from '../../assets/megahealth.png';

class Header extends Component {

  componentDidMount() {
  }

  render() {
    const { title } = this.props;
    return (
      <div className="header-container">
        <div>
          <img src={LOGO} alt="" />
        </div>
        <div>{ title }</div>
        <div>
          {/* <Link to="/">登出</Link> */}
          {/* <Icon type="wifi" /> */}
          <SmileOutlined />
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
