
import React from 'react';

const Loader = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
      <p className="text-lg text-cyan-300 font-semibold">{message}</p>
    </div>
  );
};

export default Loader;
