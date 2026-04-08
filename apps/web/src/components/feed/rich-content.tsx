import Link from 'next/link';

export function RichContent({ content }: { content: string }) {
  const parts = content.split(/(#\w+)/g);
  return (
    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-3">
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <Link
            key={i}
            href={`/hashtag/${part.slice(1)}`}
            className="text-brand hover:underline"
          >
            {part}
          </Link>
        ) : (
          part
        ),
      )}
    </p>
  );
}
