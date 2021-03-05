import React, { Component } from 'react';
import './Table.scss';
import { PullToRefresh, Button, ListView  } from 'antd-mobile';
import { createHashHistory } from 'history';
import normal_png from '../../assets/normal.png'
import middle_png from '../../assets/middle.png'
import light_png from '../../assets/light.png'
import invalid_png from '../../assets/invalid.png'
import heavy_png from '../../assets/heavy.png'
import delete_png from '../../assets/delete.png'
import img_device from '../../assets/img_device.png'
import no_report from '../../assets/noreport.png'

class Table extends Component {
  constructor(props) {
    super(props);
  }
  toDeviceDetail = (id) => {
    const history = createHashHistory();
    history.push(`/app/device/${id}`);
  }
  render() { 
    console.log(this.props)
    const { type, dataSource, pagination, loadMore, btnClick, btnDelete} = this.props;
    return (
      <div className='table-box'>
        {
          type == 'reportList'?
            dataSource.length>0?
            <div>
              {dataSource.map((report) => {
                return (
                  <div className='table-report' key={ report.id } onClick={ ()=>btnClick(report) }>
                    <div>
                      <img src={ 
                        report.AHI.degree == "无效"? invalid_png: 
                        report.AHI.degree == "正常"? normal_png:
                        report.AHI.degree == "轻度"? light_png:
                        report.AHI.degree == "中度"? middle_png:
                        report.AHI.degree == "重度"? heavy_png :invalid_png
                      }
                      />
                    </div>
                    <div className='table-text'>
                      <p><span>{ report.date }</span><span>AHI { report.AHI.ahi }</span></p>
                      <p><span>用户：{ report.name }</span><span>SN：{ report.sn }</span></p>
                    </div>
                    <div className='table-delete' onClick={ (e)=>{
                      if(e&&e.stopPropagation){e.stopPropagation();}else{window.event.cancelBubble=true;}
                      btnDelete(report);
                    }}>
                      <img src={ delete_png } alt=""/>
                    </div>
                  </div>
                )
              })}
            </div>
            :<div className='noreport'>
              <img src={no_report}/>
            </div>
          :
            <div>
              {dataSource.map((device)=>{
                return (
                <div className='table-device' key={device.key} onClick={()=>this.toDeviceDetail(device.key)}>
                  <div>
                    <img src={ img_device }/>
                  </div>
                  <div className='table-text'>
                    <p><span>设备状态：</span><span style={{ color:device.status.color }}>{ device.status.str }</span></p>
                    <p><span>设备编号：</span><span>{ device.deviceSN }</span></p>
                    <p><span>固件版本：</span><span>{ device.versionNO }</span></p>
                  </div>
                </div>
              )
              })}
              
            </div>
        }
        <div>
          <div className='more-btn' onClick={()=>loadMore(pagination)}>
            <span>加载更多</span>
          </div>
        </div>
      </div>
      
    );
  }
}

export default Table;