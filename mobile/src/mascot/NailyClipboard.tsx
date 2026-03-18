import React from 'react';
import ClipboardSvg from '../../assets/mascot/naily-clipboard.svg';

interface Props { size?: number; }

export default function NailyClipboard({ size = 120 }: Props) {
  return <ClipboardSvg width={size} height={size} />;
}
