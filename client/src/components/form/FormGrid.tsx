'use client';

import React from 'react';
import styles from './FormGrid.module.css';

interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 1,
  gap = 'md',
  className,
}) => {
  return (
    <div
      className={`${styles.formGrid} ${styles[`columns-${columns}`]} ${styles[`gap-${gap}`]} ${className || ''}`}
    >
      {children}
    </div>
  );
};
