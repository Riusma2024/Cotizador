import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, FileText, Package, Users, Contact, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { storage } from '../../storage';
import type { CompanyConfig } from '../../types';

const NavItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string, onClick?: () => void }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={clsx(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
        >
            <Icon size={20} className={clsx(isActive ? 'text-blue-600' : 'text-gray-400')} />
            {label}
        </Link>
    );
};

export const AppLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeCompany, setActiveCompany] = useState<CompanyConfig | null>(null);
    const location = useLocation();

    useEffect(() => {
        const companies = storage.getCompanies();
        const activeId = storage.getActiveCompanyId();
        const active = companies.find(c => c.id === activeId) || null;
        setActiveCompany(active);
    }, [location.pathname]);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
                <Link to="/" onClick={closeMenu} className="flex items-center">
                    {activeCompany?.logoUrl ? (
                        <img src={activeCompany.logoUrl} alt={activeCompany.name} className="h-8 max-w-[150px] object-contain" />
                    ) : (
                        <span className="text-xl font-bold text-blue-600">QuoterPro</span>
                    )}
                </Link>
                <button
                    onClick={toggleMenu}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeMenu}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 hidden lg:flex items-center px-6 border-b border-gray-200">
                    <Link to="/" className="flex items-center">
                        {activeCompany?.logoUrl ? (
                            <img src={activeCompany.logoUrl} alt={activeCompany.name} className="h-10 max-w-[180px] object-contain" />
                        ) : (
                            <span className="text-xl font-bold text-blue-600">QuoterPro</span>
                        )}
                    </Link>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)] lg:max-h-none">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={closeMenu} />
                    <NavItem to="/quotes" icon={FileText} label="Cotizaciones" onClick={closeMenu} />
                    <NavItem to="/customers" icon={Users} label="Clientes" onClick={closeMenu} />
                    <NavItem to="/employees" icon={Contact} label="Personal" onClick={closeMenu} />
                    <NavItem to="/catalog" icon={Package} label="Catálogo" onClick={closeMenu} />
                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <NavItem to="/settings" icon={Settings} label="Configuración" onClick={closeMenu} />
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                <div className="max-w-5xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
