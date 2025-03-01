import React from 'react';

const MonitorComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white from-gray-900 to-gray-800 p-4 text-white">
            <div className="flex flex-col items-center justify-between w-[900px] h-[600px] bg-black overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default MonitorComponent;