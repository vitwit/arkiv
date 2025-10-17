export default function ActivePlansList() {
  const plans = [
    { id: 1, pair: 'ETH → USDC', amount: '$100/week', nextBuy: 'Aug 15' },
    { id: 2, pair: 'BTC → ETH', amount: '$50/day', nextBuy: 'Aug 12' }
  ];

  return (
    <ul className="space-y-3">
      {plans.map(plan => (
        <li key={plan.id} className="flex justify-between border-b pb-2">
          <div>
            <p className="font-medium">{plan.pair}</p>
            <p className="text-sm text-gray-500">{plan.amount}</p>
          </div>
          <span className="text-sm text-gray-400">Next: {plan.nextBuy}</span>
        </li>
      ))}
    </ul>
  );
}
