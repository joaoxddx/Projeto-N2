import React from 'react';

interface CardProps {
  title: string;
  content: React.ReactNode;
  footer?: string;
}

export const Card = ({ title, content, footer }: CardProps) => {
  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <div className="card-text">{content}</div>
        {footer && <small className="text-muted">{footer}</small>}
      </div>
    </div>
  );
};
