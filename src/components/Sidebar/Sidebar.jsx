import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Sidebar.scss';
import { NavLink } from 'react-router-dom';
import { Translation } from 'react-i18next';
import AV from 'leancloud-storage';
var roleType = null
class Sidebar extends Component {
  componentWillMount() {
    const user = AV.User.current();
    roleType = user.attributes.roleType
  }

  render() {
    const { tabs } = this.props;
    return (
      <ul className="sidebar-container">
        {
          tabs.map((item, index) => (
            roleType?(
              item.role.indexOf(roleType)!==-1?
              <NavLink to={item.path} activeClassName="active" key={item.path}>
                <li>
                  <img src={item.icon} alt="" />
                  <Translation>
                  {
                    t => <span>{t(item.name)}</span>
                  }
                </Translation>    
                </li>
              </NavLink>
              :null
            ):null
          ))
        }
      </ul>
    );
  }
}

Sidebar.propTypes = {
  tabs: PropTypes.array.isRequired
};

export default Sidebar;
