
import React from 'react';

interface BombIconProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export const BombIcon: React.FC<BombIconProps> = ({ 
  size = 40, 
  color = '#bc76b6', 
  backgroundColor = '#2f146b' 
}) => {
  const containerSize = Math.round(size * 2.2);
  
  return (
    <i 
      className="fa fa-bomb" 
      style={{
        color: color,
        fontSize: `${size}px`,
        boxSizing: 'content-box',
        lineHeight: `${containerSize}px`,
        textAlign: 'center',
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        display: 'inline-block',
        overflow: 'hidden',
        borderRadius: '0px',
        backgroundColor: backgroundColor
      }}
    />
  );
};
