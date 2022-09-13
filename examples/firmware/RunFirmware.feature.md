# Run the firmware

> The Asset Tracker should run the firmware

## The firmware should have been run

Then the Firmware CI run device log should contain

```
azure_iot_hub_integration: cloud_wrap_init:  The Asset Tracker v2 has started
azure_iot_hub_integration: cloud_wrap_init:  Version:      ${appVersion}-original
azure_iot_hub_integration: cloud_wrap_init:  Client ID:    ${deviceId}
azure_iot_hub_integration: cloud_wrap_init:  Cloud:        Azure IoT Hub
azure_iot_hub_integration: cloud_wrap_init:  DPS endpoint: global.azure-devices-provisioning.net
azure_iot_hub_integration: cloud_wrap_init:  ID scope:     ${idScope}
```
