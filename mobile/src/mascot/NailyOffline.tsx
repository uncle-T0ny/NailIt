import React from 'react';
import OfflineSvg from '../../assets/mascot/naily-offline.svg';

interface Props { size?: number; }

export default function NailyOffline({ size = 120 }: Props) {
  return <OfflineSvg width={size} height={size} />;
}
