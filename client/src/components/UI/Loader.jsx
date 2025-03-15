import React from 'react';
import { RingLoader } from 'react-spinners';

// Colors match the blue theme in the cart system
const PRIMARY_COLOR = '#2563eb'; // Blue-600 from your color scheme

const Loader = ({ size = 50, color = PRIMARY_COLOR, loading = true, className = '' }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <RingLoader color={color} loading={loading} size={size} />
    </div>
  );
};

export default Loader;
