import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import { connect } from 'react-redux';
import Creator from '../../actions/Creator';
import AV from 'leancloud-storage';
import { Modal } from 'antd-mobile';
import './Header.scss';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      routePath:''
    }
  }
  componentDidMount(){
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
  headerLeft = () => {
    const { title } = this.props; 
    if(title == '当前设备'){
      window.history.go(-1)
    }
  }
  render() {
    const user = AV.User.current();
    const { getAllReportsData, setFilter } = this.props;
    return (
      <div className="header-container-1" >
        <div className='header-cont'>
          <span onClick={ this.headerLeft }>{ this.props.title == '当前设备' ? '返回' : '筛选' }</span>
          <span className='header-title'>{ this.props.title }</span>
          <span 
            onClick={()=>{
              setFilter({reportType: ['all'],startDate: null,endDate: null,deviceId: null,}); 
              getAllReportsData(10,1, {reportType: ['all'],startDate: null,endDate: null,deviceId: null,})
            }}
          >刷新</span>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  allReports: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.bool,
    reportsData: PropTypes.array,
    pagination: PropTypes.object,
    filter: PropTypes.object
  }).isRequired,
  getAllReportsData: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  setHeader: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    title: state.header.title,
    allReports: state.allReports
  }
);

const mapDispatchToProps = dispatch => ({
  setHeader(title) {
    dispatch(Creator.setHeader(title));
  },
  getAllReportsData(limit, current, filter) {
    dispatch(Creator.getAllReportsData(limit, current, filter));
  },
  setFilter(filter) {
    dispatch(Creator.setFilter(filter));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
