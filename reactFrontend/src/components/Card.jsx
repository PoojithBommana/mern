import React from 'react';

const Card = ({ title, description, children, className = '', padded = true, ...props }) => (
  <div className={`bm-card ${className}`} {...props}>
    {(title || description) && (
      <div className="border-b border-slate-100 px-6 py-4">
        {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
    )}
    <div className={padded ? 'p-6' : ''}>{children}</div>
  </div>
);

export default Card;
