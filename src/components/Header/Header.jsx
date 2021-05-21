import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import { connect } from 'react-redux';
import Creator from '../../actions/Creator';
import AV from 'leancloud-storage';
import './Header.scss';
import back_png from '../../assets/left.svg'

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routePath: ''
    }
  }
  componentDidMount() {
  }

  headerLeft = () => {
    const { title } = this.props;
    if (title == '当前设备') {
      window.history.go(-1)
    }
  }
  refresh = () => {
    const { getAllReportsData, setFilter, getAllDevice, allDevice, title } = this.props;
    if (title == '报告列表') {
      setFilter({ reportType: ['all'], startDate: null, endDate: null, deviceId: null, });
      getAllReportsData(10, 1, { reportType: ['all'], startDate: null, endDate: null, deviceId: null, })
    }
    if (title == '设备列表') getAllDevice({
      current:1,
      pageSize:10,
      total:0,
    })
  }

  render() {
    const user = AV.User.current();
    const { title } = this.props
    return (
      <div className={ title=='当前设备'||title == '设备列表'?'header-container-2':'header-container-1' } >
        <div className='header-cont'>
          {
            title == '当前设备'?
              <span onClick={this.headerLeft} style={{ paddingRight:'0.5rem' }}>
                <img style={{ width:'0.45rem',height:'0.75rem' }} src={back_png} alt=""/>
              </span>
              :null
          }
          <span className='header-title'>{title}</span>
          {
            title=='报告列表' || title == '设备列表'
            ?<span
              onClick={this.refresh}
              >刷新</span>
            :null
          }
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  allDevice: PropTypes.shape({
    pagination: PropTypes.object
  }).isRequired,
  getAllDevice: PropTypes.func.isRequired,
  getAllReportsData: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  setHeader: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    title: state.header.title,
    allDevice: state.allDevice,
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
  getAllDevice(pagination) {
    dispatch(Creator.getAllDevice(pagination))
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
