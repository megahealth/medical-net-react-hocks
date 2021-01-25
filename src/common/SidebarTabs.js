import ALL_REPORTS from '../assets/all-reports.png';
// import VALID_REPORTS from '../assets/valid-reports.png';
import DEVICE from '../assets/device.png';
import DEVICE_DETAIL from '../assets/device-detail.png';

const SidebarTabs = [
  {
    path: '/app/allreports',
    icon: ALL_REPORTS,
    name: '报告列表',
    role:[5,6]
  },
  // {
  //   path: '/validreports',
  //   icon: VALID_REPORTS,
  //   name: '有效报告'
  // },
  {
    path: '/app/device',
    icon: DEVICE,
    name: '设备状态',
    role:[5]
  },
  {
    path: '/app/devicedetail',
    icon: DEVICE_DETAIL,
    name: '设备管理',
    role:[6]
  }
];

export default SidebarTabs;
