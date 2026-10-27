import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useSmartHome } from '../context/SmartHomeContext';
import { EmergencyBottomBar } from './EmergencyBottomBar';

function formatEventTime(timestamp, timeOfDay) {
  if (timestamp) {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }
  }
  if (timeOfDay) {
    // If "07:02:00" -> format to 7:02 AM
    const parts = timeOfDay.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parts[1];
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    }
  }
  return timeOfDay || '';
}

function getEventDescription(log) {
  if (log.action_type === 'Opened emergency help screen') {
    return 'Opened emergency help screen';
  }
  const actionMap = {
    TOGGLE_ON: 'Turned on',
    TOGGLE_OFF: 'Turned off',
    UNLOCK: 'Unlocked',
    LOCK: 'Locked'
  };
  const action = actionMap[log.action_type] || 
    (log.action_type.startsWith('TEMP_') ? `Set to ${log.action_type.replace('TEMP_', '')}°C` : log.action_type);
  
  return `${log.device_name} — ${action}`;
}

export function ActivityLogModal({ isOpen, onClose }) {
  const { habitLogs, preferences } = useSmartHome();
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);
  const [barHeight, setBarHeight] = useState(76);
  const [hasExistingBar, setHasExistingBar] = useState(false);

  const closeBtnRef = useRef(null);
  const sheetRef = useRef(null);
  const closingTimeoutRef = useRef(null);
  const pushedHistoryRef = useRef(false);

  // Measure emergency bar height so sheet bottom edge rests right on top of it
  const updateBarHeight = useCallback(() => {
    const bar = document.querySelector('.emergency-bottom-bar');
    if (bar) {
      setHasExistingBar(true);
      const rect = bar.getBoundingClientRect();
      setBarHeight(Math.round(rect.height));
    } else {
      setHasExistingBar(false);
      setBarHeight(76);
    }
  }, []);

  // Initiate closing animation
  const handleClose = useCallback(() => {
    if (isClosing) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (pushedHistoryRef.current && window.history.state?.activityHistoryOpen) {
        pushedHistoryRef.current = false;
        window.history.back();
      }
      onClose();
      setIsRendered(false);
      return;
    }

    setIsClosing(true);
    closingTimeoutRef.current = setTimeout(() => {
      if (pushedHistoryRef.current && window.history.state?.activityHistoryOpen) {
        pushedHistoryRef.current = false;
        window.history.back();
      }
      onClose();
      setIsRendered(false);
      setIsClosing(false);
    }, 220); // 220ms slide down animation
  }, [isClosing, onClose]);

  // Handle open / close transitions
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setShowAllDays(false);
      updateBarHeight();

      // Push history state so browser Back action closes the sheet
      if (!window.history.state?.activityHistoryOpen) {
        window.history.pushState({ activityHistoryOpen: true }, '');
        pushedHistoryRef.current = true;
      }

      // Lock page scrolling
      document.body.style.overflow = 'hidden';

      // Move focus to Close button
      const focusTimer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      const handlePopState = () => {
        pushedHistoryRef.current = false;
        handleClose();
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleClose();
        } else if (e.key === 'Tab' && sheetRef.current) {
          // Trap focus inside sheet
          const focusables = sheetRef.current.querySelectorAll(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', updateBarHeight);

      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = '';
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', updateBarHeight);
        // Return focus to View History button on close
        const openBtn = document.getElementById('btn-settings-open-logs');
        if (openBtn) openBtn.focus();
      };
    } else {
      document.body.style.overflow = '';
      if (closingTimeoutRef.current) clearTimeout(closingTimeoutRef.current);
      setIsRendered(false);
      setIsClosing(false);
    }
  }, [isOpen, handleClose, updateBarHeight]);

  if (!isRendered) return null;

  // Group logs by day
  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

  const groups = {};
  const groupOrder = [];

  const sortedLogs = [...habitLogs].sort((a, b) => b.timestamp - a.timestamp);

  sortedLogs.forEach((log) => {
    const logDate = new Date(log.timestamp);
    const dateKey = logDate.toDateString();
    let label = '';

    if (dateKey === todayStr) {
      label = 'Today';
    } else if (dateKey === yesterdayStr) {
      label = 'Yesterday';
    } else {
      label = logDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }

    if (!groups[label]) {
      groups[label] = [];
      groupOrder.push({ label, isRecent: label === 'Today' || label === 'Yesterday' });
    }
    groups[label].push(log);
  });

  const visibleGroups = showAllDays 
    ? groupOrder 
    : groupOrder.filter(g => g.isRecent);

  const hasEarlierDays = groupOrder.some(g => !g.isRecent);

  return (
    <>
      {/* Dim layer over rest of the page (Ink at ~35% opacity), not over emergency bar */}
      <div 
        className={`activity-history-dim ${isClosing ? 'is-closing' : ''}`}
        style={{ bottom: `${barHeight}px` }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Standalone Emergency Bottom Bar if not already mounted on this page */}
      {!hasExistingBar && <EmergencyBottomBar />}

      {/* Bottom Sheet resting directly on top of fixed emergency bar */}
      <section 
        ref={sheetRef}
        className={`activity-history-sheet ${isClosing ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-sheet-title"
        style={{ bottom: `${barHeight}px` }}
      >
        {/* Fixed Header Row */}
        <header className="history-sheet-header">
          <div className="history-sheet-inner history-sheet-header-inner">
            <h2 id="history-sheet-title" className="history-sheet-title">
              Activity History
            </h2>
            <button
              ref={closeBtnRef}
              id="btn-close-activity-history"
              type="button"
              className="btn-history-close"
              onClick={handleClose}
              aria-label="Close activity history"
            >
              <X size={24} strokeWidth={2.5} aria-hidden="true" />
              <span>Close</span>
            </button>
          </div>
        </header>

        {/* Scrollable List Body */}
        <div className="history-sheet-scrollable">
          <div className="history-sheet-inner history-sheet-body-inner">
            {/* Privacy Reassurance Sentence */}
            <div className="history-privacy-sentence" role="note">
              <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>
                These records are stored purely on your device to power predictable smart suggestions.
              </span>
            </div>

            {sortedLogs.length === 0 ? (
              <div className="history-empty-state">
                Nothing here yet. What you switch on and off will show up here.
              </div>
            ) : (
              <div className="history-days-list">
                {visibleGroups.map((group) => (
                  <section key={group.label} className="history-day-section" aria-label={`Events for ${group.label}`}>
                    <h3 className="history-day-heading">
                      {group.label}
                    </h3>
                    <div className="history-entries-list">
                      {groups[group.label].map((log) => (
                        <div key={log.log_id} className="history-entry-row">
                          <span className="history-entry-time">
                            {formatEventTime(log.timestamp, log.time_of_day)}
                          </span>
                          <span className="history-entry-desc">
                            {getEventDescription(log)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                {!showAllDays && hasEarlierDays && (
                  <div className="history-show-more-row">
                    <button
                      type="button"
                      className="btn-show-earlier-days"
                      onClick={() => setShowAllDays(true)}
                    >
                      Show earlier days
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default ActivityLogModal;
