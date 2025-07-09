import { SvgXml } from 'react-native-svg';
import React from 'react';

interface SvgIconProps {
  width?: number;
  height?: number;
  color?: string;
  xml: string;
}

export const SvgIcon: React.FC<SvgIconProps> = ({ 
  width = 24, 
  height = 24, 
  color, 
  xml 
}) => {
  return (
    <SvgXml
      width={width}
      height={height}
      xml={xml}
      fill={color}
    />
  );
}; 