import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
    title?: string;
    children: React.ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        document.title = title ? `${title} | DCA Bot` : 'DCA Bot';
    }, [title]);

    return (
        <div className="min-h-screen flex bg-gray-900 text-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content wrapper */}
            <div className="flex flex-col flex-1 min-h-screen">
                {/* Navbar */}
                <Navbar
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                />

                {/* Main content with left padding on md+ to offset sidebar */}
                <main className="flex-1 container mx-auto px-4 py-8">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
}
