import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ValidReportsPage.scss';
import { connect } from 'react-redux';
// import { Redirect } from 'react-router-dom';
// import AV from 'leancloud-storage';
import Creator from '../../actions/Creator';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';

import SidebarTabs from '../../common/SidebarTabs';

class ValidReportsPage extends Component {
  componentDidMount() {
  }

  render() {

    return (
      <div className="container">
        <Header />
        <div className="content">
          <Sidebar tabs={SidebarTabs} />
          <div className="content-r">
            有效报告
          </div>
        </div>
      </div>
    );
  }
}

ValidReportsPage.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ValidReportsPage);
