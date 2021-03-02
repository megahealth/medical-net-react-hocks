import React, { Component } from 'react';
import './Table.scss';
import { PullToRefresh, Button } from 'antd-mobile';
import normal_png from '../../assets/normal.png'
import middle_png from '../../assets/middle.png'
import light_png from '../../assets/light.png'
import invalid_png from '../../assets/invalid.png'
import heavy_png from '../../assets/heavy.png'
import delete_png from '../../assets/delete.png'
import img_device from '../../assets/img_device.png'
class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {  }
  }
  render() { 
    return ( 
      <div className='table-box'>
        {
          this.props.type == 'reportList'?
          <PullToRefresh
          indicator={{deactivate:' '}}
          >
            <div className='table-report'>
                <div>
                  <img src={ normal_png } alt="" srcset=""/>
                </div>
                <div className='table-text'>
                  <p><span>2020-06-11</span><span>AHI 1.9</span></p>
                  <p><span>用户：未登记</span><span>SN：P11D71901000650</span></p>
                </div>
                <div className='table-delete'>
                  <img src={ delete_png } alt="" srcset=""/>
                </div>
            </div>
            <div className='table-report'>
                <div>
                  <img src={ middle_png } alt="" srcset=""/>
                </div>
                <div className='table-text'>
                  <p><span>2020-06-11</span><span>AHI 1.9</span></p>
                  <p><span>用户：未登记</span><span>SN：P11D71901000650</span></p>
                </div>
                <div className='table-delete'>
                  <img src={ delete_png } alt="" srcset=""/>
                </div>
            </div>
            <div className='table-report'>
                <div>
                  <img src={ light_png } alt="" srcset=""/>
                </div>
                <div className='table-text'>
                  <p><span>2020-06-11</span><span>AHI 1.9</span></p>
                  <p><span>用户：未登记</span><span>SN：P11D71901000650</span></p>
                </div>
                <div className='table-delete'>
                  <img src={ delete_png } alt="" srcset=""/>
                </div>
            </div>
            <div className='table-report'>
                <div>
                  <img src={ invalid_png } alt="" srcset=""/>
                </div>
                <div className='table-text'>
                  <p><span>2020-06-11</span><span>AHI 1.9</span></p>
                  <p><span>用户：未登记</span><span>SN：P11D71901000650</span></p>
                </div>
                <div className='table-delete'>
                  <img src={ delete_png } alt="" srcset=""/>
                </div>
            </div>
            <div className='table-report'>
                <div>
                  <img src={ heavy_png } alt="" srcset=""/>
                </div>
                <div className='table-text'>
                  <p><span>2020-06-11</span><span>AHI 1.9</span></p>
                  <p><span>用户：未登记</span><span>SN：P11D71901000650</span></p>
                </div>
                <div className='table-delete'>
                  <img src={ delete_png } alt="" srcset=""/>
                </div>
            </div>
            <div className='table-report'>
                <div>
                  <img src={ normal_png } alt="" srcset=""/>
                </div>
                <div className='table-text'>
                  <p><span>2020-06-11</span><span>AHI 1.9</span></p>
                  <p><span>用户：未登记</span><span>SN：P11D71901000650</span></p>
                </div>
                <div className='table-delete'>
                  <img src={ delete_png } alt="" srcset=""/>
                </div>
            </div>
          </PullToRefresh>
          :
          <PullToRefresh
            indicator={{deactivate:' '}}
          >
            <div className='table-device'>
                <div>
                  <img src={ img_device } alt="" srcset=""/>
                </div>
                <div className='table-text'>
                  <p><span>设备状态：</span><span style={{ color:'#1E58DE' }}>已连接</span></p>
                  <p><span>设备编号：</span><span>P11D71901000650</span></p>
                  <p><span>固件版本：</span><span>2.4.9620</span></p>
                </div>
            </div>
            <div className='table-device'>
                <div>
                  <img src={ img_device } alt="" srcset=""/>
                </div>
                <div className='table-text'>
                  <p><span>设备状态：</span><span style={{ color:'#FC6063' }}>未连接</span></p>
                  <p><span>设备编号：</span><span>P11D71901000650</span></p>
                  <p><span>固件版本：</span><span>2.4.9620</span></p>
                </div>
            </div>
          </PullToRefresh>
        }
      </div>
      
    );
  }
}

export default Table;