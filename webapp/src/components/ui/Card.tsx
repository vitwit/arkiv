interface CardProps {
  title?: string;
  children: React.ReactNode;
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className="bg-gray-800 shadow rounded-lg p-4 overflow-hidden break-words">
      {title && (
        <h2 className="text-lg font-semibold text-white mb-4 break-words">
          {title}
        </h2>
      )}
      <div className="text-gray-200 break-words">{children}</div>
    </div>
  );
}
