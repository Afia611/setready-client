import Link from "next/link";

export type PageInfo = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type RouteQuery = Promise<Record<string, string | string[] | undefined>>;

export function pageParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "1";
}

export default function Pagination({
  path,
  query = {},
  pagination,
}: {
  path: string;
  query?: Record<string, string>;
  pagination?: PageInfo;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages } = pagination;
  const control =
    "rounded-lg border border-stone-300 px-3 py-2 font-semibold hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2";

  function pageHref(number: number) {
    const params = new URLSearchParams({ ...query, page: String(number) });
    return `${path}?${params}`;
  }

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-4 text-sm">
      {page > 1 && <Link href={pageHref(page - 1)} className={control} rel="prev">Previous</Link>}
      <span aria-current="page">Page {page} of {totalPages}</span>
      {page < totalPages && <Link href={pageHref(page + 1)} className={control} rel="next">Next</Link>}
    </nav>
  );
}
