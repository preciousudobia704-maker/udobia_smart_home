import React from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';

export function EmergencyBottomBar() {
  return (
    <nav className="emergency-bottom-bar-nav" aria-label="Emergency Help Quick Access">
      <Link 
        to="/emergency" 
        id="btn-emergency-bottom-bar"
        className="emergency-bottom-bar"
        aria-label="I Need Help Now - See what to do and who to call"
      >
        <div className="emergency-bar-inner">
          <div className="emergency-bar-icon-wrap" aria-hidden="true">
            <LifeBuoy size={34} strokeWidth={2.6} />
          </div>
          <div className="emergency-bar-text-group">
            <span className="emergency-bar-title">I Need Help Now</span>
            <span className="emergency-bar-subtitle">See what to do and who to call</span>
          </div>
        </div>
      </Link>
    </nav>
  );
}

export default EmergencyBottomBar;
