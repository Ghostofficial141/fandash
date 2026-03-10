import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`jm-card ${className}`} {...props}>
            {children}
        </div>
    );
};

export default Card;
