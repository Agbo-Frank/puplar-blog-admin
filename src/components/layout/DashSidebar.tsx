import { Link, useLocation } from 'react-router-dom';
import { Ic } from '../icons';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',  label: 'Overview',    icon: Ic.Chart,    route: '/overview' },
  { id: 'posts',     label: 'Posts',       icon: Ic.Doc,      route: '/posts',    badge: '9' },
  { id: 'media',     label: 'Media',       icon: Ic.Image,    route: '/media' },
  { id: 'taxonomy',  label: 'Categories',  icon: Ic.Folder,   route: '/taxonomy' },
  { id: 'tags',      label: 'Tags',        icon: Ic.Tag,      route: '/taxonomy' },
  { id: 'schedule',  label: 'Schedule',    icon: Ic.Calendar, route: '/schedule' },
];

interface DashSidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
}

export function DashSidebar({ collapsed = false, onCollapse }: DashSidebarProps) {
  const { pathname } = useLocation();
  const w = collapsed ? 'w-[60px]' : 'w-[232px]';

  return (
    <aside className={`${w} shrink-0 border-r border-stone-200 bg-white flex flex-col h-full transition-[width] duration-200`}>
      {/* Logo */}
      <div
        className={`h-14 flex items-center ${collapsed ? 'justify-center' : 'px-4'} border-b border-stone-200 cursor-pointer`}
        onClick={onCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <div className="flex items-center gap-2 text-puplar-700">
          <Ic.Logo className="w-7 h-7 shrink-0" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-[15px] tracking-[-0.01em] text-stone-900">puplar</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-stone-500">blog studio</span>
            </div>
          )}
        </div>
      </div>

      {/* New post button */}
      <div className={collapsed ? 'px-2 py-3' : 'px-3 py-3'}>
        <Link
          to="/posts/new"
          className={`w-full bg-puplar-700 hover:bg-puplar-900 text-white rounded-md text-[13px] font-semibold flex items-center justify-center gap-2 transition ${collapsed ? 'p-2' : 'px-3 py-2'}`}
        >
          <Ic.Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New post</span>}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.route || (item.route !== '/' && pathname.startsWith(item.route));
          return (
            <Link
              key={item.id}
              to={item.route}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 ${collapsed ? 'justify-center px-2' : 'px-2.5'} py-2 rounded-md text-[13px] font-medium transition ${
                isActive
                  ? 'bg-stone-100 text-stone-900'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live stats */}
      {!collapsed && (
        <div className="p-3 border-t border-stone-200">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-stone-600">Live</span>
            </div>
            <div className="text-[12px] text-stone-700 leading-snug">
              142 posts published.{' '}
              <a href="#" className="text-puplar-700 font-medium hover:underline">
                Visit blog →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className={`border-t border-stone-200 ${collapsed ? 'p-2' : 'p-3'}`}>
        <Link
          to="/settings"
          className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''} text-[13px] text-stone-600 hover:text-stone-900 transition`}
        >
          <Ic.Settings className="w-4 h-4" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
