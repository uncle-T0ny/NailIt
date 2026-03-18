import React from 'react';
import ShrugSvg from '../../assets/mascot/naily-shrug.svg';

interface Props { size?: number; }

export default function NailyShrug({ size = 120 }: Props) {
  return <ShrugSvg width={size} height={size} />;
}
