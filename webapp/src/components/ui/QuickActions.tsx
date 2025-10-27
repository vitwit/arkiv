import {
  CloudArrowUpIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { useEffect, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { useWalletStore } from '../../store/walletStore';
import { getInstitutionDetails, type InstitutionDetails } from '../../lib/dcaQuery';

interface Action {
  title: string;
  icon: JSX.Element;
  to: string;
}

export default function QuickActions({ role }: { role: string }) {
  let actions: Action[] = [];
  const { account } = useWalletStore();

  const [institution, setInstitution] = useState<InstitutionDetails | null>(null);

  useEffect(() => {
    if (account && role == 'institution') {
      getInstitutionDetails(account).then((data) => {
        setInstitution(data)
      });
    }
  }, [account]);

  if (role === 'user') {
    actions = [
      {
        title: 'Upload New Record',
        icon: <CloudArrowUpIcon className="h-10 w-10 text-blue-400" />,
        to: '/upload',
      },
      {
        title: 'Records',
        icon: <ShieldCheckIcon className="h-10 w-10 text-green-400" />,
        to: '/records',
      },

      {
        title: 'My Profile',
        icon: <BuildingOffice2Icon className="h-10 w-10 text-yellow-400" />,
        to: '/profile',
      },
    ];
  } else if (role === 'institution') {
    actions = [
      {
        title: 'Records Shared',
        icon: <UserGroupIcon className="h-10 w-10 text-purple-400" />,
        to: '/user-shared',
      },
      {
        title: 'Profile',
        icon: <BuildingOffice2Icon className="h-10 w-10 text-yellow-400" />,
        to: '/profile',
      },
    ];
    if (!institution) {
      actions = [
        ...actions,
        {
          title: 'Register as institution',
          icon: <BuildingOffice2Icon className="h-10 w-10 text-yellow-400" />,
          to: '/register-institution',
        },
      ];
    }
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {actions.map((action, idx) => (
        <Link
          key={idx}
          to={action.to}
          className="cursor-pointer bg-gray-800 bg-opacity-70 rounded-2xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center hover:-translate-y-1 transform duration-200"
        >
          <div className="mb-3">{action.icon}</div>
          <h3 className="text-lg font-semibold text-white">{action.title}</h3>
        </Link>
      ))}
    </section>
  );
}
