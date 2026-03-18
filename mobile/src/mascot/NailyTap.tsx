import React from 'react';
import TapSvg from '../../assets/mascot/naily-tap.svg';

interface Props { size?: number; }

export default function NailyTap({ size = 120 }: Props) {
  return <TapSvg width={size} height={size} />;
}
