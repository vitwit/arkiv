export default function RecentActivity() {
  const activity = [
    { id: 1, date: 'Aug 8', batch: '#21', pair: 'ETH→USDC', total: '3.2 ETH' },
    { id: 2, date: 'Aug 6', batch: '#20', pair: 'BTC→ETH', total: '0.5 BTC' }
  ];

  return (
    <ul className="space-y-3">
      {activity.map(item => (
        <li key={item.id} className="flex justify-between border-b pb-2">
          <div>
            <p className="font-medium">{item.date} - Batch {item.batch}</p>
            <p className="text-sm text-gray-500">{item.pair}</p>
          </div>
          <span className="text-sm text-gray-400">{item.total}</span>
        </li>
      ))}
    </ul>
  );
}
