import React, { useEffect, useRef } from 'react';
import Button from './Button';

const GlobalReach: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    // Create grid cells
    const columns = Math.ceil(window.innerWidth / 64);
    const rows = Math.ceil(window.innerHeight / 64);

    // Clear existing cells
    gridRef.current.innerHTML = '';

    // Create new cells
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.style.setProperty('--blink-duration', `${3 + Math.random() * 4}s`);
        cell.style.setProperty('--blink-delay', `${Math.random() * 5}s`);
        cell.style.left = `${j * 64}px`;
        cell.style.top = `${i * 64}px`;
        gridRef.current.appendChild(cell);
      }
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0">
        <div ref={gridRef} className="absolute inset-0 overflow-hidden hidden sm:block"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(147,197,253,0.1),transparent)]"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 relative">
        <div className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight px-4 sm:px-0">
            Global reach: 800 million profiles
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
            With close to a billion records across the globe, TalGPT helps you fulfill any search,
            no matter how specific. And once you've found the perfect fit, TalGPT provides you
            with the contact information to get in touch right away.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 px-4 sm:px-0">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Try for free
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Request a demo →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalReach;