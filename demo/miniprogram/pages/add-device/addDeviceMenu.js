// const showWifiConfMenu = (redirect = false) => {
//   wx.showActionSheet({
//     itemList: ['SoftAP 配网', 'SmartConfig 配网', 'SimpleConfig 配网', 'AirKiss 配网', 'BLE Combo 配网'],
//     alertText: 'Wi-Fi 配网',
//     success: ({ tapIndex }) => {
//       const navigate = redirect ? wx.redirectTo : wx.navigateTo;
//       switch (tapIndex) {
//         case 0:
//           navigate({
//             url: '/pages/add-device/soft-ap/soft-ap',
//           });
//           break;
//         case 1:
//           navigate({
//             url: '/pages/add-device/smart-config/smart-config',
//           });
//           break;
//         case 2:
//           navigate({
//             url: '/pages/add-device/simple-config/simple-config',
//           });
//           break;
//         case 3:
//           navigate({
//             url: '/pages/add-device/air-kiss/air-kiss',
//           });
//           break;
//         case 4:
//           navigate({
//             url: '/pages/add-device/ble-combo/ble-combo',
//           });
//           break;
//       }
//     }
//   });
// };

module.exports = (redirect = false) => {
  wx.showActionSheet({
    itemList: ['SoftAP 配网', 'SmartConfig 配网', 'BLE Combo 配网'],
    alertText: 'Wi-Fi 配网',
    success: ({ tapIndex }) => {
      const navigate = redirect ? wx.redirectTo : wx.navigateTo;
      switch (tapIndex) {
        case 0:
          navigate({
            url: '/pages/add-device/soft-ap/soft-ap',
          });
          break;
        case 1:
          navigate({
            url: '/pages/add-device/smart-config/smart-config',
          });
          break;
        case 2:
          navigate({
            url: '/pages/add-device/ble-combo/ble-combo',
          });
          break;
      }
    }
  });
};
