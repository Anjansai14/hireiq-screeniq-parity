import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout, { useCrumbs } from '../layouts/AppLayout';
import { useHQ } from '../hooks/useHQ';
import {
  LoginScreen,
  DashboardScreen,
  CourseBriefScreen,
  CampaignsScreen,
  CampaignWizardScreen,
  CampaignDetailScreen,
  SourceDetailScreen,
  CreatorBankScreen,
  SourceProfileScreen,
  CopilotScreen,
  ArtifactsScreen,
  SettingsScreen
} from '../screens';

/**
 * RouteSync synchronizes React Router params with legacy in-memory HQ.s.route
 * and publishes breadcrumbs to AppLayout via useCrumbs.
 */
function RouteSync({ name, getCrumbs, children }) {
  const params = useParams();
  const setCrumbs = useCrumbs();
  const { HQ, currentCourse } = useHQ();

  useEffect(() => {
    HQ.set((z) => {
      z.route = { name, ...params };
    });
    if (getCrumbs && typeof setCrumbs === 'function') {
      setCrumbs(getCrumbs({ params, currentCourse, HQ }));
    }
  }, [name, JSON.stringify(params), currentCourse?.id, setCrumbs, HQ]);

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginScreen />} />

      {/* Protected application shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RouteSync
              name="dashboard"
              getCrumbs={() => [{ label: 'Dashboard' }]}
            >
              <DashboardScreen />
            </RouteSync>
          }
        />

        {/* Course Brief */}
        <Route
          path="/brief"
          element={
            <RouteSync
              name="brief"
              getCrumbs={({ currentCourse }) => [
                { label: currentCourse?.title || 'Course', to: '/dashboard' },
                { label: 'Course brief' }
              ]}
            >
              <CourseBriefScreen />
            </RouteSync>
          }
        />
        <Route
          path="/brief/:tab"
          element={
            <RouteSync
              name="brief"
              getCrumbs={({ currentCourse }) => [
                { label: currentCourse?.title || 'Course', to: '/dashboard' },
                { label: 'Course brief' }
              ]}
            >
              <CourseBriefScreen />
            </RouteSync>
          }
        />

        {/* Campaigns */}
        <Route
          path="/campaigns"
          element={
            <RouteSync
              name="campaigns"
              getCrumbs={() => [{ label: 'Campaigns' }]}
            >
              <CampaignsScreen />
            </RouteSync>
          }
        />

        {/* Campaign Wizard */}
        <Route
          path="/campaigns/new"
          element={
            <RouteSync
              name="wizard"
              getCrumbs={() => [
                { label: 'Campaigns', to: '/campaigns' },
                { label: 'New campaign' }
              ]}
            >
              <CampaignWizardScreen />
            </RouteSync>
          }
        />
        <Route
          path="/campaigns/:id/setup"
          element={
            <RouteSync
              name="wizard"
              getCrumbs={() => [
                { label: 'Campaigns', to: '/campaigns' },
                { label: 'Campaign setup' }
              ]}
            >
              <CampaignWizardScreen />
            </RouteSync>
          }
        />

        {/* Campaign Detail */}
        <Route
          path="/campaigns/:id"
          element={
            <RouteSync
              name="campaign"
              getCrumbs={({ params, HQ }) => [
                { label: 'Campaigns', to: '/campaigns' },
                { label: HQ.camp(params.id)?.name || 'Campaign' }
              ]}
            >
              <CampaignDetailScreen />
            </RouteSync>
          }
        />
        <Route
          path="/campaigns/:id/:tab"
          element={
            <RouteSync
              name="campaign"
              getCrumbs={({ params, HQ }) => [
                { label: 'Campaigns', to: '/campaigns' },
                { label: HQ.camp(params.id)?.name || 'Campaign' }
              ]}
            >
              <CampaignDetailScreen />
            </RouteSync>
          }
        />

        {/* Influencer / Source Detail within Campaign */}
        <Route
          path="/campaigns/:campId/influencers/:ccId"
          element={
            <RouteSync
              name="influencer"
              getCrumbs={({ params, HQ }) => {
                const c = HQ.camp(params.campId);
                const cc = HQ.ccOf(params.campId, params.ccId);
                const cr = cc ? HQ.creator(cc.creatorId) : null;
                return [
                  { label: 'Campaigns', to: '/campaigns' },
                  { label: c?.name || 'Campaign', to: `/campaigns/${params.campId}` },
                  { label: cr?.name || 'Source' }
                ];
              }}
            >
              <SourceDetailScreen />
            </RouteSync>
          }
        />
        <Route
          path="/campaigns/:campId/influencers/:ccId/:tab"
          element={
            <RouteSync
              name="influencer"
              getCrumbs={({ params, HQ }) => {
                const c = HQ.camp(params.campId);
                const cc = HQ.ccOf(params.campId, params.ccId);
                const cr = cc ? HQ.creator(cc.creatorId) : null;
                return [
                  { label: 'Campaigns', to: '/campaigns' },
                  { label: c?.name || 'Campaign', to: `/campaigns/${params.campId}` },
                  { label: cr?.name || 'Source' }
                ];
              }}
            >
              <SourceDetailScreen />
            </RouteSync>
          }
        />

        {/* Creator Bank */}
        <Route
          path="/creators"
          element={
            <RouteSync
              name="creators"
              getCrumbs={() => [
                { label: 'Settings', to: '/settings/connectors' },
                { label: 'Creator Bank' }
              ]}
            >
              <CreatorBankScreen />
            </RouteSync>
          }
        />
        <Route
          path="/creators/:id"
          element={
            <RouteSync
              name="creator"
              getCrumbs={({ params, HQ }) => [
                { label: 'Creator Bank', to: '/creators' },
                { label: HQ.creator(params.id)?.name || 'Source' }
              ]}
            >
              <SourceProfileScreen />
            </RouteSync>
          }
        />
        <Route
          path="/creators/:id/:tab"
          element={
            <RouteSync
              name="creator"
              getCrumbs={({ params, HQ }) => [
                { label: 'Creator Bank', to: '/creators' },
                { label: HQ.creator(params.id)?.name || 'Source' }
              ]}
            >
              <SourceProfileScreen />
            </RouteSync>
          }
        />

        {/* Copilot */}
        <Route
          path="/copilot"
          element={
            <RouteSync
              name="copilot"
              getCrumbs={() => [{ label: 'Copilot' }]}
            >
              <CopilotScreen mode="page" />
            </RouteSync>
          }
        />
        <Route
          path="/copilot/:threadId"
          element={
            <RouteSync
              name="copilot"
              getCrumbs={() => [
                { label: 'Copilot', to: '/copilot' },
                { label: 'Thread' }
              ]}
            >
              <CopilotScreen mode="page" />
            </RouteSync>
          }
        />

        {/* Artifacts / Files */}
        <Route
          path="/artifacts"
          element={
            <RouteSync
              name="files"
              getCrumbs={() => [{ label: 'Artifacts' }]}
            >
              <ArtifactsScreen />
            </RouteSync>
          }
        />
        <Route path="/files" element={<Navigate to="/artifacts" replace />} />

        {/* Settings */}
        <Route path="/settings" element={<Navigate to="/settings/connectors" replace />} />
        <Route
          path="/settings/:tab"
          element={
            <RouteSync
              name="settings"
              getCrumbs={({ params }) => {
                const tabTitles = {
                  connectors: 'Connectors',
                  ratecard: 'Rate card',
                  profile: 'Profile'
                };
                return [
                  { label: 'Settings', to: '/settings/connectors' },
                  { label: tabTitles[params.tab] || 'Settings' }
                ];
              }}
            >
              <SettingsScreen />
            </RouteSync>
          }
        />
      </Route>

      {/* Wildcard redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
