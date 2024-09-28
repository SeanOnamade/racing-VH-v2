import React from 'react';

const ValidTrack = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      {/* Blank Canvas */}
      <canvas
        width={800} 
        height={600} 
        style={{ border: '1px solid black', marginBottom: '20px' }} 
      />
    </div>
  );
};

export default ValidTrack;
