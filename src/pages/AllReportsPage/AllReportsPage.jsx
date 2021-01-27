import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import { connect } from 'react-redux';
import { Table, Skeleton, Space } from 'antd';
import { Translation } from 'react-i18next';

import Creator from '../../actions/Creator';
import './AllReportsPage.scss';

const columns = [
  {
    title: <Translation>
      {t => <span>{t('Column Head Index')}</span>}
    </Translation>,
    dataIndex: 'index',
    align: 'center'
  },
  {
    title: <Translation>
      {t => <span>{t('Column Head Name')}</span>}
    </Translation>,
    dataIndex: 'name',
    align: 'center'
  },
  {
    title: <Translation>
      {t => <span>{t('SN')}</span>}
    </Translation>,
    dataIndex: 'sn',
    align: 'center',
    render: (text, record) => (
      <Space size="middle">
        <a onClick={(e) => toDeviceDetail(e, record)}>{text}</a>
      </Space>
    )
  },
  {
    title: <Translation>
      {t => <span>{t('Column Head Date')}</span>}
    </Translation>,
    dataIndex: 'date',
    align: 'center'
  },
  {
    title: 'AHI',
    dataIndex: 'AHI',
    align: 'center',
    render: ahi => <Translation>
      {t => <span style={{ color: ahi.color }}>{ahi.ahi+` (${t(ahi.degree)})`}</span>}
    </Translation>
  },
  {
    title: <Translation>
      {t => <span>{t('Column Head Time')}</span>}
    </Translation>,
    dataIndex: 'time',
    align: 'center'
  }
];
function toDeviceDetail(e, id) {
  e.stopPropagation();
  const history = createHashHistory();
  history.push(`/app/device/${id.idDevice}`);
}
class AllReportsPage extends Component {
  componentDidMount() {
    const { allReports, getAllReportsData } = this.props;
    getAllReportsData(10, 1, allReports.filter);
  }

  toReport = (id) => {
    const history = createHashHistory();
    history.push(`/report/${id}`);
  }

  render() {
    const { allReports, getAllReportsData } = this.props;
    return (
      <React.Fragment>
        {
          allReports.loading
            ? <div className="content-loading"><Skeleton /></div>
            : <div className="content-r">
              <div className="content-r-c">
                <Table
                  onRow={item => {
                    return { onClick: () => this.toReport(item.id) };
                  }}
                  columns={columns}
                  dataSource={allReports.reportsData}
                  pagination={allReports.pagination}
                  onChange={res => getAllReportsData(10, res.current, allReports.filter)}
                ></Table>
              </div>
            </div>
        }
      </React.Fragment>
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
