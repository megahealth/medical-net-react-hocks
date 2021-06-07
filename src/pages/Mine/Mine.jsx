import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createHashHistory } from 'history';
import { connect } from 'react-redux';
import Creator from '../../actions/Creator';
import AV from 'leancloud-storage';
import { Button,Modal, Toast } from 'antd-mobile';
import './Mine.scss'
class Mine extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      name:''
    }
  }
  async componentDidMount(){
    const { setHeader } = this.props;
    const user = AV.User.current();
    console.log(user);
    setHeader('我的')
    const name = user.get('name')
    let reportTitle = ''
    let hotelID = ''
    if(user.get('idBaseOrg')){
      const queryHotel = new AV.Query('Hotel');
      queryHotel.equalTo("idBaseOrg",user.get('idBaseOrg'));
      const hotelResult = await queryHotel.find();
      reportTitle = (hotelResult[0]&&hotelResult[0].get('reportTitle')) || ''
      hotelID = (hotelResult[0]&&hotelResult[0].id) || ''
    }
    
    this.setState({
      isFocus:false,
      name,
      reportTitle,
      editReportTitle:reportTitle,
      hotelID,
    })
  }
  logOut = (t) => {
    Modal.alert('退出登录', "确定要退出登录吗？", [
      {
        text: '取消',
        onPress: () => console.log('cancel')
      },
      {
        text: '确定',
        onPress: () => {
          this.props.clearDeviceList();
          this.props.clearReportList();
          AV.User.logOut();
          window.location.hash = '/';
        }
      },
    ]);
  }
  onSave = async () => {
    console.log('ccccccccc',this.state);
    const { editReportTitle, hotelID } = this.state;
    if(hotelID){
      const todo = AV.Object.createWithoutData('Hotel', hotelID);
      todo.set('reportTitle', editReportTitle);
      try {
        await todo.save();
        Toast.success('保存成功！',3)
        this.setState({
          reportTitle:editReportTitle,
          isFocus:false,
        })
      } catch (error) {
        Toast.fail('保存失败！',3)
      }
    }else{
      Toast.fail('没有获取到机构id',3)
    }
    
  }
  render() { 
    const { name,editReportTitle,isFocus, reportTitle } = this.state;
    console.log(editReportTitle,isFocus, reportTitle);
    return ( 
      <div className="content-r">
        <div className="content-r-c">
          <div className="mine">
            <div className='mine-info'>
              <label>用户名</label>
              <span>{ name }</span>
            </div>
            <div className='mine-info'>
              <label>报告名</label>
              <input 
                type="text" 
                value={editReportTitle!=undefined?editReportTitle : ''} 
                className="reportTitle-input" 
                maxLength = "20"
                onFocus = {()=>this.setState({ isFocus:true })}
                onChange = {(e)=>{this.setState({ editReportTitle:e.target.value })}}
              />
              {
                isFocus?<>
                  <span className="click-span" onClick={ ()=>this.setState({ editReportTitle:reportTitle,isFocus:false }) }>x</span>
                  <span className="click-span" style={{ fontSize:'0.4rem' }} onClick={this.onSave}>√</span>
                </>
                :null
              }
              
            </div>
            <div className='mine-logout'>
              <Button type="warning" onClick={this.logOut}>退出登录</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Mine.propTypes = {
  title: PropTypes.string.isRequired,
  setHeader: PropTypes.func.isRequired,
  clearReportList: PropTypes.func.isRequired,
  clearDeviceList:PropTypes.func.isRequired,
};

const mapStateToProps = state => (
  {
    title: state.header.title,
  }
);

const mapDispatchToProps = dispatch => ({
  setHeader(title) {
    dispatch(Creator.setHeader(title));
  },
  clearDeviceList(){
    dispatch(Creator.clearDeviceList());
  },
  clearReportList(){
    dispatch(Creator.clearReportList());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Mine);