import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

const Icon: React.FC<IconProps> = ({ name, className = '', filled = false }) => {
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'material-symbols-filled' : ''} ${className}`}
      style={{ userSelect: 'none' }} // Prevent text selection
    >
      {name}
    </span>
  );
};

export default Icon;
