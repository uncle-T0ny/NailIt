import React from 'react';
import ErrorSvg from '../../assets/mascot/naily-error.svg';

interface Props { size?: number; }

export default function NailyError({ size = 120 }: Props) {
  return <ErrorSvg width={size} height={size} />;
}
