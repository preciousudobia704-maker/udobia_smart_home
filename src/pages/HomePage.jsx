import React from 'react';
import { DashboardGreeting } from '../components/DashboardGreeting';
import { SuggestionCard } from '../components/SuggestionCard';
import { DeviceGrid } from '../components/DeviceGrid';
import { EmergencyBottomBar } from '../components/EmergencyBottomBar';

export function HomePage() {
  return (
    <div className="page-home">
      {/* Warm Time-Aware Greeting (Based on real system clock) */}
      <DashboardGreeting />

      {/* Suggestion Banner (Always visible on main dashboard whenever a suggestion condition is met) */}
      <SuggestionCard />

      {/* Tactile Device Grid Grouped By Room */}
      <DeviceGrid />

      {/* Fixed Emergency Help Bottom Entry Bar */}
      <EmergencyBottomBar />
    </div>
  );
}

export default HomePage;
