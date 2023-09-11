# :heavy_check_mark: Firmware

> Failed: 0  
> Passed: 1  
> Total: 1  
> Duration: ⏲ 0 ms

## :heavy_check_mark: RunFirmware.feature

### :heavy_check_mark: The firmware should have been run

:heavy_check_mark: **Then** the Firmware CI run device log should contain

```
azure_iot_hub_integration: cloud_wrap_init:  The Asset Tracker v2 has started
azure_iot_hub_integration: cloud_wrap_init:  Version:      v1.0.0-original
azure_iot_hub_integration: cloud_wrap_init:  Client ID:    my-tracker
azure_iot_hub_integration: cloud_wrap_init:  Cloud:        Azure IoT Hub
azure_iot_hub_integration: cloud_wrap_init:  DPS endpoint: global.azure-devices-provisioning.net
azure_iot_hub_integration: cloud_wrap_init:  ID scope:     0n283efa
```
