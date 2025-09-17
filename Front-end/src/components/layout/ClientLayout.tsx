// Algeria Eats Hub - Client Layout

import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const ClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};