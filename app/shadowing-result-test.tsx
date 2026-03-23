import React from 'react';
import ShadowingResultScreen from '@/src/components/ShadowingResultScreen';

export default function ShadowingResultTest() {
  return (
    <ShadowingResultScreen
      onBack={() => console.log('Back pressed')}
      onNext={() => console.log('Next pressed')}
    />
  );
}
