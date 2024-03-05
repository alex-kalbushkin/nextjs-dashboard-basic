import clsx from 'clsx';
import Link from 'next/link';
import { lusitana } from '../fonts';

interface IBreadcrumbItem {
  href: string;
  label: string;
  active?: boolean;
}

const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: IBreadcrumbItem[] }) => (
  <nav aria-label="Breadcrumb" className="mb-[24px] block">
    <ol className={clsx(lusitana.className, 'flex text-xl md:text-2xl')}>
      {breadcrumbs.map((breadcrumbItem, breadcrumbItemIndex) => (
        <li
          key={breadcrumbItem.href}
          aria-current={breadcrumbItem.active}
          className={clsx(
            breadcrumbItem.active ? 'text-gray-800 ' : 'r text-gray-500',
          )}
        >
          <Link href={breadcrumbItem.href}>{breadcrumbItem.label}</Link>
          {breadcrumbItemIndex < breadcrumbs.length - 1 ? (
            <span className="mx-3 inline-block">/</span>
          ) : null}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
