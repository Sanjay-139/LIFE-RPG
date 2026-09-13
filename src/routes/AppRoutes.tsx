import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { AuthCallbackPage } from '../pages/AuthCallbackPage';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { QuestsPage } from '../pages/QuestsPage';
import { QuestCreatePage } from '../pages/QuestCreatePage';
import { QuestDetailPage } from '../pages/QuestDetailPage';
import { CharacterPage } from '../pages/CharacterPage';
import { AttributesPage } from '../pages/AttributesPage';
import { ProgressionPage } from '../pages/ProgressionPage';
import { StreaksPage } from '../pages/StreaksPage';
import { RewardsPage } from '../pages/RewardsPage';
import { InventoryPage } from '../pages/InventoryPage';
import { AchievementsPage } from '../pages/AchievementsPage';
import { ProgressPage } from '../pages/ProgressPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/*  */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/*  */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/quests" element={<QuestsPage />} />
        <Route path="/quests/create" element={<QuestCreatePage />} />
        <Route path="/quests/:id" element={<QuestDetailPage />} />
        <Route path="/character" element={<CharacterPage />} />
        <Route path="/character/attributes" element={<AttributesPage />} />
        <Route path="/progression" element={<ProgressionPage />} />
        <Route path="/streaks" element={<StreaksPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/*  */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
