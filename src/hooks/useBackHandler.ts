/**
 * useBackHandler Hook
 * Android戻るボタンとiOSスワイプバック対応
 */

import { useEffect } from 'react';
import { BackHandler, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

interface UseBackHandlerOptions {
  onBackPress?: () => boolean | void;
  disabled?: boolean;
  routeFallback?: string;
}

/**
 * Android戻るボタン、iOSスワイプバックを統一的に処理するHook
 * @param onBackPress - 戻る前に実行する処理（trueを返すと標準動作をキャンセル）
 * @param disabled - Hookを無効化するフラグ
 * @param routeFallback - 戻る場所がない場合に遷移するパス（デフォルト: '/(tabs)/'）
 */
export function useBackHandler({
  onBackPress,
  disabled = false,
  routeFallback = '/(tabs)/',
}: UseBackHandlerOptions = {}) {
  const router = useRouter();
  const { goBack } = router;

  useEffect(() => {
    if (disabled) return;

    const handleBackPress = () => {
      // カスタム処理がある場合は実行
      if (onBackPress) {
        const result = onBackPress();
        // trueを返した場合は標準動作をキャンセル
        if (result === true) {
          return true;
        }
      }

      // 通常の戻る動作を実行
      // expo-routerはネイティブスタックを持つため、goBack()で対応
      try {
        goBack();
      } catch (error) {
        // goBack()に失敗した場合はフォールバック遷移
        router.replace(routeFallback);
      }

      return true;
    };

    // Android: BackHandlerリスナーを登録
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // クリーンアップ
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [onBackPress, disabled, goBack, router, routeFallback]);
}

/**
 * 確認ダイアログ付きのBack Handler
 * 危険な操作（未保存のデータなど）の場合に確認を表示
 */
export function useBackHandlerWithConfirm({
  shouldConfirm,
  confirmTitle = '確認',
  confirmMessage = '本当に戻りますか？',
  onConfirm,
  onCancel,
  routeFallback = '/(tabs)/',
}: {
  shouldConfirm: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  routeFallback?: string;
} = {
  shouldConfirm: false,
}) {
  const router = useRouter();

  useBackHandler({
    onBackPress: () => {
      if (!shouldConfirm) {
        return false; // 標準動作を実行
      }

      // 確認ダイアログを表示
      // Alert の代わりに、React Native Alert を使う
      const { Alert } = require('react-native');
      Alert.alert(confirmTitle, confirmMessage, [
        {
          text: 'キャンセル',
          onPress: onCancel,
          style: 'cancel',
        },
        {
          text: '戻る',
          onPress: () => {
            onConfirm?.();
            router.back();
          },
          style: 'destructive',
        },
      ]);

      return true; // BackHandler イベントを消費
    },
    routeFallback,
  });
}
