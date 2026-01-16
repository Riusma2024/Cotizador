import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, FileText, Package, Users, Contact, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { storage } from '../../storage';
import type { CompanyConfig } from '../../types';

const NavItem = ({ to, icon: Icon, label, onClick, mobileOnly = false }: { to: string; icon: any; label: string, onClick?: () => void, mobileOnly?: boolean }) => {
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
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                mobileOnly && 'lg:hidden'
            )}
        >
            <Icon size={20} className={clsx(isActive ? 'text-blue-600' : 'text-gray-400')} />
            {label}
        </Link>
    );
};

const BottomTab = ({ to, icon: Icon, label, isActive, onClick }: { to?: string; icon: any; label: string; isActive?: boolean; onClick?: () => void }) => {
    const content = (
        <div className={clsx(
            "flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-200 active:scale-90",
            isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
        )}>
            <div className={clsx(
                "p-1 rounded-xl transition-colors",
                isActive ? "bg-blue-50" : "bg-transparent"
            )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
        </div>
    );

    if (to) {
        return <Link to={to} onClick={onClick} className="flex-1">{content}</Link>;
    }
    return <button onClick={onClick} className="flex-1">{content}</button>;
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
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
            {/* Desktop Header Sidebar (Top part) */}
            <header className="lg:hidden h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
                <Link to="/" onClick={closeMenu} className="flex items-center">
                    {activeCompany?.logoUrl ? (
                        <img src={activeCompany.logoUrl} alt={activeCompany.name} className="h-7 max-w-[140px] object-contain" />
                    ) : (
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">QuoterPro</span>
                    )}
                </Link>
            </header>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden transition-all duration-300"
                    onClick={closeMenu}
                />
            )}

            {/* Sidebar (Ahora actúa como menú "Más" en móvil) */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 shadow-2xl lg:shadow-none",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 hidden lg:flex items-center px-6 border-b border-gray-200 bg-white">
                    <Link to="/" className="flex items-center">
                        {activeCompany?.logoUrl ? (
                            <img src={activeCompany.logoUrl} alt={activeCompany.name} className="h-10 max-w-[180px] object-contain" />
                        ) : (
                            <span className="text-xl font-bold text-blue-600">QuoterPro</span>
                        )}
                    </Link>
                </div>

                <div className="p-6 lg:hidden flex items-center justify-between border-b border-gray-100 mb-2">
                    <span className="font-bold text-gray-900">Opciones</span>
                    <button onClick={closeMenu} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)] lg:max-h-none">
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
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden pb-24 lg:pb-8">
                <div className="max-w-5xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
                <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] rounded-2xl flex items-center justify-around h-16 px-2 overflow-hidden">
                    <BottomTab
                        to="/"
                        icon={LayoutDashboard}
                        label="Inicio"
                        isActive={location.pathname === '/'}
                    />
                    <BottomTab
                        to="/quotes"
                        icon={FileText}
                        label="Quotes"
                        isActive={location.pathname.startsWith('/quotes')}
                    />
                    <BottomTab
                        to="/catalog"
                        icon={Package}
                        label="Catálogo"
                        isActive={location.pathname === '/catalog'}
                    />
                    <BottomTab
                        icon={Menu}
                        label="Más"
                        isActive={isMobileMenuOpen}
                        onClick={toggleMenu}
                    />
                </div>
            </nav>
        </div>
    );
};
