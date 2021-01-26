import ALL_REPORTS from '../assets/all-reports.png';
// import VALID_REPORTS from '../assets/valid-reports.png';
import DEVICE from '../assets/device.png';
import DEVICE_DETAIL from '../assets/device-detail.png';

const SidebarTabs = [
  {
    path: '/app/allreports',
    icon: ALL_REPORTS,
    name: 'Report list',
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
    name: 'Device list',
    role:[5]
  },
  {
    path: '/app/devicedetail',
    icon: DEVICE_DETAIL,
    name: 'Device management',
    role:[6]
  }
];

export default SidebarTabs;
