import React from 'react';

interface SkeletonLoaderProps {
  darkMode?: boolean;
  rows?: number;
  cardHeader?: boolean;
  cardBody?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  darkMode = false, 
  rows = 3,
  cardHeader = true,
  cardBody = true
}) => {
  const headerColor = darkMode ? 'bg-dark' : 'bg-light';
  const bodyColor = darkMode ? 'bg-dark' : 'bg-light';
  const skeletonColor = darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light';
  
  return (
    <div className={`card shadow-sm ${darkMode ? 'bg-dark text-light border-light' : 'bg-white'}`}>
      {cardHeader && (
        <div className={`card-header rounded-top-2 d-flex justify-content-between align-items-center ${headerColor}`}>
          <div className={`placeholder-glow w-25 ${skeletonColor} py-2 rounded`}></div>
          <div className={`placeholder-glow w-15 ${skeletonColor} py-1 rounded`}></div>
        </div>
      )}
      {cardBody && (
        <div className={`card-body p-4 ${bodyColor}`}>
          <div className={`mb-4 ${skeletonColor} placeholder-glow`}>
            <div className="d-flex align-items-center justify-content-center flex-wrap">
              <div className={`me-3 ${skeletonColor} placeholder-glow`} style={{ width: '48px', height: '48px' }}></div>
              <div>
                <div className={`placeholder-glow w-75 ${skeletonColor} py-3 rounded`} style={{ height: '24px' }}></div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12">
              <div className={`card h-100 ${darkMode ? 'bg-dark border-light' : 'bg-white'}`}>
                <div className={`card-header rounded-top-2 ${darkMode ? 'bg-dark text-light border-light' : 'bg-light text-dark border-dark'}`}>
                  <div className={`placeholder-glow w-50 ${skeletonColor} py-2 rounded`}></div>
                </div>
                <div className="card-body">
                  {[...Array(rows)].map((_, idx) => (
                    <div key={idx} className="mb-3">
                      <div className={`placeholder-glow w-100 ${skeletonColor} py-2 rounded mb-2`}></div>
                      <div className={`placeholder-glow w-75 ${skeletonColor} py-2 rounded`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className={`card h-100 ${darkMode ? 'bg-dark border-light' : 'bg-white'}`}>
                <div className={`card-header rounded-top-2 ${darkMode ? 'bg-dark text-light border-light' : 'bg-light text-dark border-dark'}`}>
                  <div className={`placeholder-glow w-50 ${skeletonColor} py-2 rounded`}></div>
                </div>
                <div className="card-body">
                  <ul className="mb-0">
                    {[...Array(3)].map((_, idx) => (
                      <li key={idx} className="mb-2">
                        <div className={`placeholder-glow w-100 ${skeletonColor} py-2 rounded`}></div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className={`card h-100 ${darkMode ? 'bg-dark border-light' : 'bg-white'}`}>
                <div className={`card-header rounded-top-2 ${darkMode ? 'bg-dark text-light border-light' : 'bg-light text-dark border-dark'}`}>
                  <div className={`placeholder-glow w-50 ${skeletonColor} py-2 rounded`}></div>
                </div>
                <div className="card-body">
                  <ul className="mb-0">
                    {[...Array(3)].map((_, idx) => (
                      <li key={idx} className="mb-2">
                        <div className={`placeholder-glow w-100 ${skeletonColor} py-2 rounded`}></div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkeletonLoader;