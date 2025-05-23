import React, { useState } from 'react';
import CalendarHeader from './components/CalendarHeader';
import Sidebar from './components/Sidebar';
import CalendarGrid from './components/CalendarGrid';
import { CalendarProvider } from './context/CalendarContext';
import EventModal from './components/EventModal';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <CalendarProvider>
      <div className="flex flex-col h-screen bg-[#FAF6E3]">
        <CalendarHeader 
          isSidebarOpen={isSidebarOpen} 
          onSidebarToggle={handleSidebarToggle} 
        />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="flex-1 overflow-auto">
            <CalendarGrid />
          </main>
        </div>
        <EventModal />
      </div>
    </CalendarProvider>
  );
};

export default App;