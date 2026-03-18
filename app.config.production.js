import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

export default {
  expo: {
    name: 'EigoMaster',
    slug: 'eigomaster',
    version: '1.0.0',
    runtimeVersion: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'eigomaster',
    userInterfaceStyle: 'automatic',
    backgroundColor: '#f5f9ff',
    newArchEnabled: true,
    description: '英検準1級 リスニング・単語・ライティング統合学習アプリ',
    owner: 'eigomaster',

    // 本番環境用 iOS設定
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.eigomaster.app',
      buildNumber: '1',
      config: {
        usesNonExemptEncryption: false,
      },
      // 本番環境でのプッシュ通知設定
      entitlements: {
        'aps-environment': 'production',
      },
    },

    // 本番環境用 Android設定
    android: {
      package: 'com.eigomaster.app',
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
      ],
    },

    // Web設定
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
      // 本番環境用キャッシュ設定
      bundler: 'metro',
    },

    // プラグイン設定
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-av',
        {
          microphonePermission:
            'Allow EigoMaster to access your microphone to record shadowing exercises.',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Allow EigoMaster to access your camera to capture handwritten essays.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow EigoMaster to access your photos for essay submission.',
        },
      ],
    ],

    // 実験的機能（本番環境では安定バージョンのみ使用）
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    // 環境変数の公開
    extra: {
      eas: {
        projectId: 'your-project-id',
      },
      SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
      GA_MEASUREMENT_ID: process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID,
    },

    privacy: 'public',
  },
};
