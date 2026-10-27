import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';

export function UndoToast() {
  const { activeUndo, executeUndo, preferences } = useSmartHome();
  const [bottomOffset, setBottomOffset] = useState(96);

  // Measure emergency bar height so toast is always exactly 16px above it
  useEffect(() => {
    const updateOffset = () => {
      const bar = document.querySelector('.emergency-bottom-bar');
      if (bar) {
        const rect = bar.getBoundingClientRect();
        setBottomOffset(Math.round(rect.height) + 16);
      } else {
        setBottomOffset(16);
      }
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, [activeUndo, preferences?.text_scale]);

  if (!activeUndo) return null;

  const durationMs = preferences?.undo_timeout_ms || 5000;

  return (
    <>
      {/* Visual-only Dimming Overlay under the emergency bar and toast */}
      <div className="undo-dim-overlay" aria-hidden="true" />

      {/* Floating Undo Toast Card */}
      <aside 
        className="undo-toast-wrapper" 
        role="status" 
        aria-live="polite"
        style={{ bottom: `${bottomOffset}px` }}
      >
        <div className="undo-toast-card">
          {/* Confirmation Message */}
          <div className="undo-toast-message">
            <span className="undo-toast-text">
              {activeUndo.actionDescription}
            </span>
          </div>

          {/* Single Undo Action Control in Secondary Style (Teal Tint, Ink text) */}
          <div className="undo-toast-actions">
            <button
              id="btn-undo-action"
              type="button"
              className="btn-undo-action"
              onClick={executeUndo}
              aria-label={`Undo action: revert ${activeUndo.deviceName}`}
            >
              <RotateCcw size={22} strokeWidth={2.5} aria-hidden="true" />
              <span>Undo</span>
            </button>
          </div>

          {/* 4px Progress Bar along bottom edge */}
          <div className="undo-progress-track" aria-hidden="true">
            <div 
              className="undo-progress-fill" 
              key={activeUndo.timestamp}
              style={{ animationDuration: `${durationMs}ms` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

export default UndoToast;
