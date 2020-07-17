import ALL_REPORTS from '../assets/all-reports.png';
// import VALID_REPORTS from '../assets/valid-reports.png';
import DEVICE from '../assets/device.png';
import DEVICE_DETAIL from '../assets/device-detail.png';

const SidebarTabs = [
  {
    path: '/allreports',
    icon: ALL_REPORTS,
    name: '报告列表'
  },
  // {
  //   path: '/validreports',
  //   icon: VALID_REPORTS,
  //   name: '有效报告'
  // },
  {
    path: '/device',
    icon: DEVICE,
    name: '设备状态'
  },
  {
    path: '/devicedetail',
    icon: DEVICE_DETAIL,
    name: '设备管理'
  }
];

export default SidebarTabs;
