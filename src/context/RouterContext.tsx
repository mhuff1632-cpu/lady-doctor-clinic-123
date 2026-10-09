import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type PublicRoutePath = '/' | '/about' | '/doctors' | '/services' | '/appointment' | '/contact';
export type AdminRoutePath = '/admin/login' | '/admin' | '/admin/doctors' | '/admin/services' | '/admin/appointments' | '/admin/inquiries';
export type RoutePath = PublicRoutePath | AdminRoutePath | string;

interface RouterContextType {
  currentPath: string;
  queryParams: URLSearchParams;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const normalizePath = (pathname: string): string => {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return clean;
};

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );
  const [queryParams, setQueryParams] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search)
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
      setQueryParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    // Parse target url
    const [pathPart, queryPart] = to.split('?');
    const targetPath = normalizePath(pathPart);
    const newUrl = queryPart ? `${targetPath}?${queryPart}` : targetPath;

    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.pushState({}, '', newUrl);
    }

    setCurrentPath(targetPath);
    setQueryParams(new URLSearchParams(queryPart || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, queryParams, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

export const Link: React.FC<LinkProps> = ({
  to,
  children,
  className = '',
  activeClassName = '',
  onClick,
  ...rest
}) => {
  const { currentPath, navigate } = useRouter();
  const [targetPath] = to.split('?');
  const isActive = currentPath === normalizePath(targetPath);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();
      navigate(to);
    }
  };

  const combinedClass = `${className} ${isActive ? activeClassName : ''}`.trim();

  return (
    <a href={to} onClick={handleClick} className={combinedClass} {...rest}>
      {children}
    </a>
  );
};
