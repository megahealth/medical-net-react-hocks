import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import { connect } from 'react-redux';
import { Table, Skeleton } from 'antd';
// import { SmileOutlined } from '@ant-design/icons';
// import { DatePicker, List, Picker, Toast } from 'antd-mobile';
import { Translation } from 'react-i18next';

import Creator from '../../actions/Creator';
import Header from '../../components/Header/Header';
// import TransComponent from './TransComponent'
// import Sidebar from '../../components/Sidebar/Sidebar';
// import SidebarTabs from '../../common/SidebarTabs';
import './AllReportsPage.scss';

const columns = [
  {
    title: <Translation>
      { t => <span>{t('Column Head Index')}</span> }
    </Translation>,
    dataIndex: 'index',
    align: 'center'
  },
  {
    title: <Translation>
      { t => <span>{t('Column Head Name')}</span> }
    </Translation>,
    dataIndex: 'name',
    align: 'center'
  },
  {
    title: <Translation>
      { t => <span>{t('Column Head Date')}</span> }
    </Translation>,
    dataIndex: 'date',
    align: 'center'
  },
  {
    title: 'AHI',
    dataIndex: 'AHI',
    align: 'center'
  },
  {
    title: <Translation>
      { t => <span>{t('Column Head Time')}</span> }
    </Translation>,
    dataIndex: 'time',
    align: 'center'
  }
];

class AllReportsPage extends Component {
  componentDidMount() {
    const { allReports, getAllReportsData } = this.props;
    getAllReportsData(10, 1, allReports.filter);
  }

  toReport(id) {
    const history = createHashHistory();
    history.push(`/report/${id}`);
  }

  render() {
    const { allReports, getAllReportsData } = this.props;
    return (
      <div className="container">
        <Header />
        <div className="content">
          {/* <Sidebar tabs={SidebarTabs} /> */}
          {
            allReports.loading
            ? <div className="content-loading"><Skeleton /></div>
            : <div className="content-r">
              <div className="content-r-c">
                <Table
                  onRow={item => {
                    return { onClick: this.toReport.bind(this, item.id) };
                  }}
                  columns={columns}
                  dataSource={allReports.reportsData}
                  pagination={allReports.pagination}
                  onChange={res => getAllReportsData(10, res.current, allReports.filter)}
                ></Table>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

AllReportsPage.propTypes = {
  allReports: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.bool,
    reportsData: PropTypes.array,
    pagination: PropTypes.object,
    filter: PropTypes.object
  }).isRequired,
  getAllReportsData: PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    allReports: state.allReports
  }
);

const mapDispatchToProps = dispatch => ({
  getAllReportsData(limit, current, filter) {
    dispatch(Creator.getAllReportsData(limit, current, filter));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AllReportsPage);
