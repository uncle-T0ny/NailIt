import React from 'react';
import ThumbsUpSvg from '../../assets/mascot/naily-thumbsup.svg';

interface Props { size?: number; }

export default function NailyThumbsUp({ size = 120 }: Props) {
  return <ThumbsUpSvg width={size} height={size} />;
}
