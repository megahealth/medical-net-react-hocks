// import ALL_REPORTS from '../assets/all-reports.png';
// import VALID_REPORTS from '../assets/valid-reports.png';
// import DEVICE from '../assets/device.png';
// import DEVICE_DETAIL from '../assets/device-detail.png';
import DEVICE from '../assets/home.png'
import ALL_REPORTS from '../assets/report.png'
import USER from '../assets/my.png'
import ACTIVE_ALL_REPORTS from '../assets/report-selected.png'
import ACTIVE_DEVICE from '../assets/home-selected.png'
import ACTIVE_USER from '../assets/my-selected.png'
const SidebarTabs = [
  {
    path: '/app/allreports',
    icon: ALL_REPORTS,
    activeIcon: ACTIVE_ALL_REPORTS,
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
    activeIcon: ACTIVE_DEVICE,
    name: 'Device list',
    role:[5,6]
  },
  {
    path: '/app/devicedetail',
    icon: DEVICE,
    activeIcon: ACTIVE_DEVICE,
    name: 'Device management',
    role:[]
  },
  {
    path: '/app/mine',
    icon: USER,
    activeIcon: ACTIVE_USER,
    name: '我的',
    role:[5,6]
  }
];

export default SidebarTabs;
