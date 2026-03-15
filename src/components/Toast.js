import '../assets/styles/Toast.css';

import React, { useState, useEffect } from 'react';

export const Toast = ({ message }) => {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (message) {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  }, [message]);

  return (
    <div className={`toast ${showToast ? 'show' : ''}`}>
      <span>{message}</span>
    </div>
  );
};
