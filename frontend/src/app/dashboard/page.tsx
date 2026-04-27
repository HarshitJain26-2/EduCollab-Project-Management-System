'use client';
import AppLayout from '@/components/ui/AppLayout';
import { useAuth } from '@/context/AuthContext';
import GuideDashboard from '@/components/dashboards/GuideDashboard';
import LeaderDashboard from '@/components/dashboards/LeaderDashboard';
import MemberDashboard from '@/components/dashboards/MemberDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'guide':
        return <GuideDashboard />;
      case 'leader':
        return <LeaderDashboard />;
      case 'member':
      default:
        return <MemberDashboard />;
    }
  };

  return <AppLayout>{renderDashboard()}</AppLayout>;
}
