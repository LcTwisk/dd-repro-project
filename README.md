This is a small project that should help reproducing an (Android) React Native DataDog bug, resulting in all timings/actions to be off after locking the screen while the app is in the foreground.

## Getting started:

Please follow these steps to get the reproduction app running on your device.

1. Install dependencies:

```bash
yarn install
```

2. Create a release bundle:

```bash
yarn react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
```

3. Create a release APK:

```bash
cd android && ./gradlew assembleRelease
```

4. Install APK:

```bash
adb install app/build/outputs/apk/release/app-release.apk
```

## Reproduction steps:

1. Run project on a device (not on an emulator)
2. Disconnect any cables from the device (otherwise the device won't sleep ⚠️)
3. Lock device while app is in the foreground
4. Wait 10 minutes
5. Connect the device with your computer again
6. Unlock device
7. Inspect ADB logs containing `DEBUG_TIME`

After following these steps, you can compare the different logs. It's important to compare the actual time of the ADB log entry with the `now()` timestamp (the [TimeProvider timestamp](https://github.com/DataDog/dd-sdk-reactnative/blob/9a5bf3cf53fdb55bb99496d55d6ce7b50f817a47/packages/core/src/utils/TimeProvider.tsx#L47)) in the log payload.

While `now()` seems to match the ADB log time when initially opening the app, it's not longer correct after the device was locked for some time.

### Example logs:

```bash
# The initial log
2024-05-24 09:52:00.183 23224-23255 ReactNativeJS           com.datadogtry                       I  'DEBUG_TIME', { baseOffset: 1716534807180.3003,
                                                                                                      'Date.now()': 1716537120182,
                                                                                                      'performance.now()': 2313001.884388,
                                                                                                      'now()': 1716537120182.197 }
# The second log, emitted after the phone was locked for some time
2024-05-24 10:09:23.828 23224-23255 ReactNativeJS           com.datadogtry                       I  'DEBUG_TIME', { baseOffset: 1716534807180.3003,
                                                                                                      'Date.now()': 1716538163828,
                                                                                                      'performance.now()': 2431997.942877,
                                                                                                      'now()': 1716537239178.248 }

```

#### Analysis

The first ADB log was emitted at `2024-05-24 09:52:00.183`, which matches the `now()` of `1716537120182.197` (`Friday, 24 May 2024 09:52:00.182`)

However, the second ADB log was emitted at `2024-05-24 10:09:23.828`, while that `now()` is `1716537239178.248` (`Friday, 24 May 2024 09:53:59`).

As you can see, the second timestamp has an offset of **~15 minutes** ⚠️
