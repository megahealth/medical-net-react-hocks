import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import { connect } from 'react-redux';
import { Table, Skeleton } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { DatePicker, List, Picker, Toast } from 'antd-mobile';

import Creator from '../../actions/Creator';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import SidebarTabs from '../../common/SidebarTabs';
import './AllReportsPage.scss';

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    align: 'center'
  },
  {
    title: '姓名',
    dataIndex: 'name',
    align: 'center'
  },
  {
    title: '日期',
    dataIndex: 'date',
    align: 'center'
  },
  {
    title: 'AHI',
    dataIndex: 'AHI',
    align: 'center'
  },
  {
    title: '总记录时间',
    dataIndex: 'time',
    align: 'center'
  }
];

const selectItem = [
  {
    label: '全部报告',
    value: 'all',
  },
  {
    label: '有效报告',
    value: 'valid',
  },
  {
    label: '无效报告',
    value: 'invalid',
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

  onFilter() {
    const { allReports, getAllReportsData } = this.props;
    console.log(allReports.filter);
    getAllReportsData(10, 0, allReports.filter);
  }

  resetFilter() {
    const { setFilter, getAllReportsData } = this.props;
    const defaultFilter = {
      reportType: ['all'],
      startDate: null,
      endDate: null
    };
    setFilter(defaultFilter);
    getAllReportsData(10, 0, defaultFilter);
    console.log(this.props.allReports.dateRange);
    console.log(this.props.allReports.filter);
  }

  render() {
    const { allReports, getAllReportsData, setFilter } = this.props;
    console.log(allReports.loading)
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
                {/* <div className="content-filter">
                  <Picker
                    cols={1}
                    data={selectItem}
                    value={allReports.filter.reportType}
                    onChange={val => setFilter({reportType: val})}
                  >
                    <List.Item arrow="horizontal"></List.Item>
                  </Picker>
                  <DatePicker
                    mode="date"
                    title="选择开始日期"
                    extra="Optional"
                    minDate={allReports.dateRange.startDate}
                    maxDate={allReports.dateRange.endDate}
                    value={allReports.filter.startDate || allReports.dateRange.startDate}
                    onChange={date => {
                      const start = new Date(date.toLocaleDateString());
                      const endDate = allReports.filter.endDate || allReports.dateRange.endDate;
                      const end = new Date(new Date(endDate.toLocaleDateString()).getTime() + 86400000 - 1);
                      if (start.getTime() > end.getTime()) return Toast.fail('请选择正确的时间范围');
                      setFilter({startDate: start});
                    }}
                  >
                    <List.Item arrow="horizontal">开始日期</List.Item>
                  </DatePicker>
                  <DatePicker
                    mode="date"
                    title="选择结束日期"
                    extra="Optional"
                    minDate={allReports.dateRange.startDate}
                    maxDate={allReports.dateRange.endDate}
                    value={allReports.filter.endDate || allReports.dateRange.endDate}
                    onChange={date => {
                      const startDate = allReports.filter.startDate || allReports.dateRange.startDate;
                      const start = new Date(startDate.toLocaleDateString());
                      const end = new Date(new Date(date.toLocaleDateString()).getTime() + 86400000 - 1);
                      if (end.getTime() < start.getTime()) return Toast.fail('请选择正确的时间范围');
                      setFilter({endDate: end});
                    }}
                  >
                    <List.Item arrow="horizontal">结束日期</List.Item>
                  </DatePicker>
                  <div className="filter-button" onClick={this.onFilter.bind(this)}>
                    <SmileOutlined />
                    <span>筛选</span>
                  </div>
                  <div className="filter-button" onClick={this.resetFilter.bind(this)}>
                    <SmileOutlined />
                    <span>重置</span>
                  </div>
                </div> */}
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
  // getDateRange() {
  //   dispatch(Creator.getDateRange());
  // },
  setFilter(filter) {
    dispatch(Creator.setFilter(filter));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AllReportsPage);
