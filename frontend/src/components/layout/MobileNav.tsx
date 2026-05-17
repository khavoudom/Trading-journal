import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LogOut, Plus } from 'lucide-react';

interface SidebarSection {
  label: string;
  items: {
    icon: React.ReactNode;
    label: string;
    path: string;
    badge?: 'alert';
  }[];
}

interface MobileNavProps {
  basePath: string;
  sidebarSections: SidebarSection[];
  isActive: (path: string) => boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
  alertCount?: number;
}

const MobileNav: React.FC<MobileNavProps> = ({
  basePath,
  sidebarSections,
  isActive,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleLogout,
  alertCount = 0,
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Nav Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
          mobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 transition-opacity duration-300"
          style={{ opacity: mobileMenuOpen ? 1 : 0 }}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className="absolute left-0 top-0 h-full w-64 bg-surface border-r border-border p-4 transition-transform duration-300 ease-out"
          style={{ transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="mt-4">
            {sidebarSections.map((section) => (
              <div key={section.label}>
                <div
                  className="text-[10px] font-bold tracking-[1.5px] text-muted uppercase px-3 pb-1.5 pt-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {section.label}
                </div>
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={`${basePath}/${item.path}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.25 text-[13px] rounded-md transition-colors',
                      isActive(item.path)
                        ? 'text-green bg-green-subtle font-medium'
                        : 'text-text2 hover:text-text hover:bg-surface2',
                    )}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {item.badge === 'alert' && alertCount > 0 && (
                      <span className="w-5 h-5 bg-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                        {alertCount > 9 ? '9+' : alertCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t border-border">
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text2 hover:text-orange rounded-md hover:bg-orange-subtle transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden h-14 border-t border-border bg-surface flex items-center justify-around px-2">
        {sidebarSections
          .flatMap((s) => s.items)
          .slice(0, 4)
          .map((item) => (
            <NavLink
              key={item.path}
              to={`${basePath}/${item.path}`}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive: active }) =>
                cn(
                  'flex flex-col items-center gap-0.5 p-2 transition-colors',
                  active ? 'text-green' : 'text-muted',
                )
              }
            >
              {item.icon}
              <span className="text-[9px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        <button
          onClick={() => navigate(`?newTrade`)}
          className="w-9 h-9 bg-green rounded-full flex items-center justify-center text-black shadow-lg hover:bg-green/90 transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
        {sidebarSections
          .flatMap((s) => s.items)
          .slice(4, 6)
          .map((item) => (
            <NavLink
              key={item.path}
              to={`${basePath}/${item.path}`}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive: active }) =>
                cn(
                  'flex flex-col items-center gap-0.5 p-2 transition-colors',
                  active ? 'text-green' : 'text-muted',
                )
              }
            >
              {item.icon}
              <span className="text-[9px] font-medium">{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </>
  );
};

export default MobileNav;
