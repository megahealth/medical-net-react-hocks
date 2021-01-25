import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Sidebar.scss';
import { NavLink } from 'react-router-dom';
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
                  <span>{item.name}</span>
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
