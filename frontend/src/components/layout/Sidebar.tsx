import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useSpaceStore } from '@/store/spaceStore';
import { Settings } from 'lucide-react';

interface SidebarSection {
  label: string;
  items: {
    icon: React.ReactNode;
    label: string;
    path: string;
    badge?: 'alert';
  }[];
}

interface SidebarProps {
  basePath: string;
  sidebarSections: SidebarSection[];
  isActive: (path: string) => boolean;
  setMobileMenuOpen: (open: boolean) => void;
  alertCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  basePath,
  sidebarSections,
  isActive,
  setMobileMenuOpen,
  alertCount = 0,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { spaces, currentSpaceId } = useSpaceStore();

  return (
    <aside className="hidden lg:flex flex-col w-55 min-w-55 border-r border-border bg-bg">
      <nav className="flex-1 py-5">
        {sidebarSections.map((section) => (
          <div key={section.label}>
            <div
              className="sidebar-section text-[10px] font-bold tracking-[1.5px] text-gray-700 uppercase px-5 pb-1.5 pt-4"
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
                  'flex items-center gap-3 px-5 py-2.25 text-[13px] transition-all duration-150 border-l-2 border-transparent',
                  isActive(item.path)
                    ? 'text-green bg-green-subtle border-l-green'
                    : 'text-text2 hover:text-text hover:bg-surface',
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

      {/* User section */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-green/15 flex items-center justify-center text-[12px] font-bold text-green">
            {user?.username?.charAt(0).toUpperCase() || 'T'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-bold text-text truncate">
              {user?.username || 'Trader'}
            </div>
            <div className="text-[11px] text-gray-500">
              {spaces.find((s) => s.id === currentSpaceId)?.name || 'Pro Plan'}
            </div>
          </div>
          <button
            onClick={() => navigate(`${basePath}/settings`)}
            className="text-gray-700 hover:text-text2 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
