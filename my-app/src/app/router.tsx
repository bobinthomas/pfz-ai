import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './AppShell'
import { TodayScreen } from '@/features/today/TodayScreen'
import { SettingsScreen } from '@/features/settings/SettingsScreen'
import { ZonesScreen } from '@/features/zones/ZonesScreen'
import { TripsScreen } from '@/features/trips/TripsScreen'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: 'today', element: <TodayScreen /> },
      { path: 'zones', element: <ZonesScreen /> },
      { path: 'trips', element: <TripsScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
    ],
  },
])
