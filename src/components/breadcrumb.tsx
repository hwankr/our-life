import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-6 overflow-x-auto">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <span key={item.href} className="flex items-center gap-1.5 whitespace-nowrap">
            {idx > 0 && <ChevronRight className="h-3 w-3 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />}
            {isLast ? (
              <span className="text-zinc-900 dark:text-zinc-100 font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                {/* On mobile for deep paths, collapse middle items */}
                <span className={idx > 0 && idx < items.length - 2 && items.length > 3 ? 'hidden sm:inline' : ''}>
                  {item.label}
                </span>
                {idx > 0 && idx < items.length - 2 && items.length > 3 && (
                  <span className="sm:hidden">...</span>
                )}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
