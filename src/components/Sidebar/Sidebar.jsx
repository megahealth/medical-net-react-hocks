import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Sidebar.scss';
import { NavLink } from 'react-router-dom';

class Sidebar extends Component {

  componentDidMount() {
  }

  render() {
    const { tabs } = this.props;
    return (
      <ul className="sidebar-container">
        {
          tabs.map((item, index) => (
            <NavLink to={item.path} activeClassName="active" key={item.path}>
              <li>
                <img src={item.icon} alt="" />
                <span>{item.name}</span>
              </li>
            </NavLink>
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
