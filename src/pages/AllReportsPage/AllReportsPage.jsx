import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import { connect } from 'react-redux';
import { Skeleton, Space } from 'antd';
import { Translation } from 'react-i18next';
import { Modal, Toast, Button } from 'antd-mobile'
import Creator from '../../actions/Creator';
import AV from 'leancloud-storage';
import './AllReportsPage.scss';
import Table from '../../components/Table/Table'
const alert = Modal.alert;
class AllReportsPage extends Component {
  columns = [
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
          <a onClick={(e) => this.getSameSnReport(e, record)}>{text}</a>
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
  componentDidMount() {
    const { allReports, getAllReportsData, setHeader } = this.props;
    getAllReportsData(10, 1, allReports.filter);
    setHeader('报告')
  }
  getSameSnReport = (e, id) => {
    const { setFilter,allReports, getAllReportsData } = this.props;
    e.stopPropagation();
    setFilter({...allReports.filter,deviceId:id.idDevice});
    getAllReportsData(10, 1, {...allReports.filter,deviceId:id.idDevice});
  }
  toReport = (report) => {
    if(report.AHI.degree == '无效'){
      return (
        alert('删除无效报告','该报告为无效报告，需要删除吗?', [
          { text: '取消'},
          {
            text: '删除',
            onPress: ()=>this.deleteReport(report),
          },
        ])
      )
    }else{
      const history = createHashHistory();
      history.push(`/report/${report.id}`);
    }
    
  }
  deleteReport = (report) => {
    const { allReports, getAllReportsData } = this.props;
    const pagination = allReports.pagination;
    return new Promise((resolve) => {
      const deleteReport = AV.Object.createWithoutData('Reports', report.id);
      deleteReport.destroy().then(res => {
        Toast.success('删除成功！', 1);
        getAllReportsData(pagination.pageSize,pagination.current,allReports.filter)
        resolve();
      }).catch(error => {
        console.log(error);
        Toast.success('删除失败！', 1);
        resolve();
      })
    })
  }

  render() {
    const { allReports, getAllReportsData, setFilter } = this.props;
    return (
      <React.Fragment>
        {
          allReports.loading
            ? <div className="content-loading"><Skeleton /></div>
            : <div className="content-r">
              <div className="content-r-c">
                <Table
                  type='reportList'
                  dataSource={allReports.reportsData}
                  pagination={allReports.pagination}
                  loadMore={res => getAllReportsData( (res.pageSize + 10), res.current, allReports.filter)}
                  btnClick = { res=>this.toReport(res) }
                  btnDelete = { res=>alert('删除报告','删除不可恢复，确定要删除吗?', [
                    { text: '取消'},
                    {
                      text: '删除',
                      onPress: ()=>this.deleteReport(res),
                    },
                  ])}
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
  setFilter: PropTypes.func.isRequired,
  setHeader: PropTypes.func.isRequired,
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
  setFilter(filter) {
    dispatch(Creator.setFilter(filter));
  },
  setHeader(title) {
    dispatch(Creator.setHeader(title));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AllReportsPage);
