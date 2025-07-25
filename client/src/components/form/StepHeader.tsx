import React from 'react';
import styles from './StepHeader.module.css';

interface StepHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ title, subtitle, className }) => {
  return (
    <div className={`${styles.header} ${className || ''}`}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
};
