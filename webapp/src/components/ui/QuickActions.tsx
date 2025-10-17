import {
    CloudArrowUpIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { Link, useLocation } from 'react-router-dom';

type Role = "user" | "institution";

interface Action {
    title: string;
    icon: JSX.Element;
    to: string;
}

interface QuickActionsProps {
    role: Role;
}

export default function QuickActions({ role }: QuickActionsProps) {
    const location = useLocation();
    let actions: Action[] = [];

    if (role === "user") {
        actions = [
            {
                title: "Upload New Record",
                icon: <CloudArrowUpIcon className="h-10 w-10 text-blue-400" />,
                to: "/upload",
            },
            {
                title: "Records",
                icon: <ShieldCheckIcon className="h-10 w-10 text-green-400" />,
                to: "/records",
            },
            {
                title: "Records Shared",
                icon: <UserGroupIcon className="h-10 w-10 text-purple-400" />,
                to: "/user-shared",
            },
            {
                title: "My Profile",
                icon: <BuildingOffice2Icon className="h-10 w-10 text-yellow-400" />,
                to: "/profile",
            },
            {
                title: "Register as institution",
                icon: <BuildingOffice2Icon className="h-10 w-10 text-yellow-400" />,
                to: "/register-institution",
            },
        ];
    } else if (role === "institution") {
        actions = [
            {
                title: "Records",
                icon: <UserGroupIcon className="h-10 w-10 text-purple-400" />,
                to: "/upload",
            },
            {
                title: "Profile",
                icon: <BuildingOffice2Icon className="h-10 w-10 text-yellow-400" />,
                to: "/upload",
            },
        ];
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
