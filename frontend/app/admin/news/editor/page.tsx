export const dynamic = 'force-dynamic';

import NewsEditorClient from './NewsEditorClient';

interface PageProps {
  searchParams: { id?: string };
}

export default function Page({ searchParams }: PageProps) {
  return <NewsEditorClient editId={searchParams.id} />;
}
