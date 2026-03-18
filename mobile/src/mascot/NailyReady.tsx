import React from 'react';
import ReadySvg from '../../assets/mascot/naily-ready.svg';

interface Props { size?: number; }

export default function NailyReady({ size = 120 }: Props) {
  return <ReadySvg width={size} height={size} />;
}
