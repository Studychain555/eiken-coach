/**
 * useNetworkStatus Hook
 * ネットワーク接続状態を監視
 */

import { useEffect, useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isOnline: boolean;
  isWifi: boolean;
  type: string;
}

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: true,
    isWifi: false,
    type: 'unknown',
  });

  const handleNetworkStateChange = useCallback((state: any) => {
    const isConnected = state.isConnected ?? true;
    const type = state.type ?? 'unknown';
    const isWifi =
      state.type === 'wifi' ||
      (state.details && state.details.isConnectionExpensive === false);

    setNetworkState({
      isOnline: isConnected,
      isWifi,
      type,
    });
  }, []);

  useEffect(() => {
    // 初期状態を取得
    NetInfo.fetch().then(handleNetworkStateChange);

    // リスナーを登録
    const subscription = NetInfo.addEventListener(handleNetworkStateChange);

    return () => {
      subscription?.unsubscribe();
    };
  }, [handleNetworkStateChange]);

  return networkState;
};
