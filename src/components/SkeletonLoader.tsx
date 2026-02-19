import React from 'react';

interface SkeletonLoaderProps {
  darkMode?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ darkMode = false }) => {
  const shimmer = {
    background: darkMode 
      ? 'linear-gradient(90deg, var(--bg-elevated) 0%, var(--border) 50%, var(--bg-elevated) 100%)'
      : 'linear-gradient(90deg, var(--bg-elevated) 0%, var(--border) 50%, var(--bg-elevated) 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        borderRadius: '100px',
        marginBottom: '40px',
        ...shimmer,
        width: '140px',
        height: '44px'
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            style={{
              padding: '24px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)'
            }}
          >
            <div style={{
              width: '100px',
              height: '24px',
              marginBottom: '16px',
              borderRadius: '4px',
              ...shimmer
            }} />
            {[1, 2, 3].map((row) => (
              <div key={row} style={{ marginBottom: row < 3 ? '12px' : '0' }}>
                <div style={{
                  width: '100%',
                  height: '16px',
                  borderRadius: '4px',
                  ...shimmer
                }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
