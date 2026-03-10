import React, { forwardRef } from 'react';

const Input = forwardRef(({ className = '', ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={`jm-input ${className}`}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export default Input;
