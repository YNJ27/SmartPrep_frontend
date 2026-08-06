import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Sidebar from '../components/Sidebar';
import Suggestions from '../components/Suggestions';

const STATUS = {
  UNATTEMPTED: "unattempted",
  FIRST: "first_attempt_done",
  REVISION: "revision_done",
};

const STATUS_LABELS = {
  [STATUS.UNATTEMPTED]: "Unattempted",
  [STATUS.FIRST]: "First Attempt Done",
  [STATUS.REVISION]: "Revision Done",
};

const STATUS_OPTIONS = {
  [STATUS.UNATTEMPTED]: [STATUS.FIRST, STATUS.REVISION],
  [STATUS.FIRST]: [STATUS.REVISION, STATUS.UNATTEMPTED],
  [STATUS.REVISION]: [STATUS.FIRST, STATUS.UNATTEMPTED],
};

function groupInitialStatus(groups) {
  const initial = {};
  groups.forEach((group) => {
    initial[group.group_id] = STATUS.UNATTEMPTED;
  });
  return initial;
}




function SectionHeader({ title, count }) {
  return (
    <div className="section-header">
      <div className="section-title">{title}</div>
      <div className="section-count">
        {count} {count === 1 ? 'Group' : 'Groups'}
      </div>
    </div>
  );
}

function TopNavbar({ subjectId, unitsData, selectedUnit, setSelectedUnit, navigate }) {
  return (
    <div className="top-navbar-container">
      <div className="navbar-content">
        <div className="navbar-subject-row">
          <div style={{ width: '80px' }}></div>
          {subjectId && <h1 className="subject-heading">{subjectId}</h1>}
          <div style={{ width: '80px' }}></div>
        </div>

        {unitsData.length > 0 && (
          <div className="navbar-unit-row">
            {unitsData.map((unitObj) => {
              const isActive = unitObj.unit === selectedUnit;
              return (
                <button
                  key={unitObj.unit}
                  type="button"
                  className={`unit-nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedUnit(unitObj.unit)}
                >
                  Unit {unitObj.unit}
                </button>
              );
            })}
          </div>
        )}

        <div className="navbar-section-row">
          <a className="section-nav-link" href="#unattempted">
            Unattempted
          </a>
          <a className="section-nav-link" href="#first">
            First attempt done
          </a>
          <a className="section-nav-link" href="#revision">
            Revision done
          </a>
        </div>
      </div>
    </div>
  );
}

function CardMenu({ currentStatus, onSelect }) {
  const options = STATUS_OPTIONS[currentStatus];
  return (
    <div className="menu">
      {options.map((status) => (
        <button
          key={status}
          type="button"
          className="menu-item"
          onClick={() => onSelect(status)}
        >
          {STATUS_LABELS[status]}
        </button>
      ))}
      <button type="button" className="menu-item" onClick={() => onSelect(null)}>
        Cancel
      </button>
    </div>
  );
}

function GroupCard({ group, status, onMove, doneMap, onToggleQuestion, onResetGroupChecks }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSelect = (nextStatus) => {
    setMenuOpen(false);
    if (!nextStatus || nextStatus === status) return;
    onMove(group.group_id, nextStatus);
  };

  const selectedDoneLookup = doneMap[group.group_id] || {};
  const pendingQuestions = group.questions.filter((q) => !selectedDoneLookup[q.question_id]);
  const doneQuestions = group.questions.filter((q) => selectedDoneLookup[q.question_id]);

  return (
    <div className="card">
      <div
        className="card-header accordion-header"
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="card-title">
          <span className="dropdown-arrow">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                display: "block"
              }}
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
          <span className="card-group">Group {group.group_id}</span>
          <span className="card-frequency">
            {group.size} {group.size === 1 ? 'Question' : 'Questions'}
          </span>
        </div>
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          {isOpen && (
            <button
              type="button"
              className="reset-button card-reset-btn"
              onClick={() => onResetGroupChecks(group.group_id)}
            >
              Reset all checks
            </button>
          )}
          <button
            type="button"
            className="icon-button"
            aria-label="Change status"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((open) => !open);
            }}
          >
            <img className="icon" src="/setting.png" alt="" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="menu-popover" ref={menuRef} onClick={(event) => event.stopPropagation()}>
              <CardMenu currentStatus={status} onSelect={handleSelect} />
            </div>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="card-content questions-window" style={{ border: 'none', maxHeight: 'none', borderRadius: 0, padding: '0 16px 16px 16px' }}>
          {pendingQuestions.length === 0 && doneQuestions.length === 0 && (
            <div className="empty-state">No questions found for this group.</div>
          )}

          {pendingQuestions.map((question) => (
            <div key={question.question_id} className="question-row">
              <div className="question-card">
                <div className="question-image">
                  <img src={question.snapshot_url} alt={question.question_id} />
                </div>
              </div>
              <input
                type="checkbox"
                className="question-check"
                aria-label={`Mark ${question.question_id} done`}
                checked={!!selectedDoneLookup[question.question_id]}
                onChange={(event) =>
                  onToggleQuestion(
                    group.group_id,
                    question.question_id,
                    event.target.checked,
                  )
                }
              />
            </div>
          ))}

          {doneQuestions.length > 0 && <div className="questions-divider" />}

          {doneQuestions.map((question) => (
            <div key={question.question_id} className="question-row">
              <div className="question-card">
                <div className="question-image">
                  <img src={question.snapshot_url} alt={question.question_id} />
                </div>
              </div>
              <input
                type="checkbox"
                className="question-check"
                aria-label={`Mark ${question.question_id} not done`}
                checked={!!selectedDoneLookup[question.question_id]}
                onChange={(event) =>
                  onToggleQuestion(
                    group.group_id,
                    question.question_id,
                    event.target.checked,
                  )
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TestingFrontend({ subjectId: propSubjectId }) {
  const [unitsData, setUnitsData] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const navigate = useNavigate();

  // Read all 5 identity params from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = propSubjectId || urlParams.get('subject');
  const examType = urlParams.get('examType') || '';
  const Branch = urlParams.get('Branch') || '';
  const Year = urlParams.get('Year') || '';
  const Pattern = urlParams.get('Pattern') || '';

  const [userId, setUserId] = useState(null);
  const [groupsData, setGroupsData] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loadError, setLoadError] = useState("");
  const [doneMap, setDoneMap] = useState({});

  // Fetch all units data once on mount
  useEffect(() => {
    let isMounted = true;
    if (!subjectId) return;
    
    const params = new URLSearchParams({ examType });
    fetch(`/subjects/${subjectId}/grouped-questions?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load units data (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setUnitsData(data);
        if (data.length > 0) {
          setSelectedUnit(data[0].unit);
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error.message || "Failed to load grouped questions");
      });

    return () => {
      isMounted = false;
    };
  }, [subjectId, examType]);
  // When selected unit changes: set group data and fetch progress from Supabase
  useEffect(() => {
    if (!selectedUnit || unitsData.length === 0) return;

    setStatusMap({});
    setDoneMap({});

    const unitObj = unitsData.find(u => u.unit === selectedUnit);
    if (!unitObj) return;

    const groupsArr = unitObj.questions || [];
    setGroupsData(groupsArr);

    // Default every group to unattempted, then override with saved DB values
    setStatusMap(groupInitialStatus(groupsArr));
    const loadFromBackend = async () => {
      try {
        const params = new URLSearchParams({
          subject: subjectId, examType, Branch, Year, Pattern, unit_number: selectedUnit
        });
        const res = await fetch(`/user/progress?${params}`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.group_status && data.group_status.length) {
          const map = {};
          data.group_status.forEach(row => { map[row.group_id] = row.status; });
          setStatusMap(prev => ({ ...prev, ...map }));
        }

        if (data.question_progress && data.question_progress.length) {
          const map = {};
          data.question_progress.forEach(row => {
            if (row.is_done) {
              if (!map[row.group_id]) map[row.group_id] = {};
              map[row.group_id][row.question_id] = true;
            }
          });
          setDoneMap(map);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    };

    loadFromBackend();
  }, [selectedUnit, unitsData, subjectId, examType, Branch, Year, Pattern]);

  const groupedByStatus = useMemo(() => {
    const buckets = {
      [STATUS.UNATTEMPTED]: [],
      [STATUS.FIRST]: [],
      [STATUS.REVISION]: [],
    };
    groupsData.forEach((group) => {
      const status = statusMap[group.group_id] || STATUS.UNATTEMPTED;
      buckets[status].push(group);
    });
    return buckets;
  }, [groupsData, statusMap]);
  const handleMove = async (groupId, nextStatus) => {
    setStatusMap(prev => ({ ...prev, [groupId]: nextStatus }));
    
    try {
      await fetch('/user/group-status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subjectId, examType, Branch, Year, Pattern,
          unit_number: selectedUnit, group_id: groupId, status: nextStatus
        })
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleToggleQuestion = async (groupId, questionId, isDone) => {
    // Optimistic update
    setDoneMap(prev => {
      const next = { ...prev };
      const groupDone = { ...(next[groupId] || {}) };
      if (isDone) {
        groupDone[questionId] = true;
      } else {
        delete groupDone[questionId];
      }
      if (Object.keys(groupDone).length === 0) {
        delete next[groupId];
      } else {
        next[groupId] = groupDone;
      }
      return next;
    });

    try {
      await fetch('/user/question-progress', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subjectId, examType, Branch, Year, Pattern,
          unit_number: selectedUnit, group_id: groupId, question_id: questionId, is_done: isDone
        })
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleResetGroupChecks = async (groupId) => {
    // Optimistic update
    setDoneMap(prev => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });

    try {
      await fetch('/user/group-reset', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subjectId, examType, Branch, Year, Pattern,
          unit_number: selectedUnit, group_id: groupId
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page">
      <Sidebar currentPage="output" />
      <Suggestions />
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap");

        :root {
          --bg: #f8f9fa;
          --panel: #ffffff;
          --ink: #202124;
          --muted: #5f6368;
          --accent: #1a73e8;
          --accent-strong: #1e3a8a;
          --shadow: rgba(0, 0, 0, 0.05);
          --stroke: #e0e0e0;
          --radius: 10px;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: var(--ink);
          background: var(--bg);
        }

        .page {
          min-height: 100vh;
          padding: 0 0 64px;
          position: relative;
          margin-left: 260px;
        }

        .layout {
          margin-left: 24px;
          margin-right: max(24px, calc((100vw - 1126px) / 2));
          padding: 32px 24px;
        }

        .page::before {
          content: "";
          position: fixed;
          inset: 0;
          display: none;
          z-index: -1;
        }

        .board {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .top-navbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          margin-left: 24px;
          margin-right: max(24px, calc((100vw - 1126px) / 2));
        }

        .navbar-content {
          display: flex;
          flex-direction: column;
        }

        .navbar-subject-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
        }

        .home-button-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid var(--stroke);
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          cursor: pointer;
          font-family: "Space Grotesk", "Trebuchet MS", sans-serif;
        }

        .home-button-nav:hover {
          background: rgba(26, 115, 232, 0.12);
          border-color: rgba(26, 115, 232, 0.45);
        }

        .home-button-icon {
          width: 16px;
          height: 16px;
          object-fit: contain;
        }

        .subject-heading {
          color: var(--ink);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 20px;
          margin: 0;
          letter-spacing: 1px;
        }

        .navbar-unit-row {
          display: flex;
          width: 100%;
          border-top: 1px solid var(--stroke);
          border-bottom: 1px solid var(--stroke);
        }

        .unit-nav-btn {
          flex: 1;
          background: #ffffff;
          color: var(--ink);
          border: none;
          border-right: 1px solid var(--stroke);
          padding: 14px;
          font-weight: 600;
          font-size: 14px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .unit-nav-btn:last-child {
          border-right: none;
        }

        .unit-nav-btn.active {
          color: var(--accent);
          background: #e8f0fe;
          box-shadow: inset 0 0 0 2px var(--accent);
        }

        .navbar-section-row {
          display: flex;
          width: 100%;
          background: var(--accent);
        }

        .section-nav-link {
          flex: 1;
          color: #ffffff;
          text-decoration: none;
          padding: 12px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
        }

        .section-nav-link:last-child {
          border-right: none;
        }

        .section {
          background: var(--panel);
          border-radius: var(--radius);
          border: 1px solid var(--stroke);
          box-shadow: 0 4px 12px var(--shadow);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 540px;
          animation: float-in 0.6s ease both;
          scroll-margin-top: 84px;
        }

        .section:nth-child(2) {
          animation-delay: 0.08s;
        }

        .section:nth-child(3) {
          animation-delay: 0.16s;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
          font-size: 18px;
          letter-spacing: 0.2px;
        }

        .section-title {
          text-transform: uppercase;
          font-size: 14px;
          color: var(--muted);
          letter-spacing: 1.5px;
        }

        .section-count {
          background: rgba(26, 115, 232, 0.12);
          color: var(--accent-strong);
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .card {
          background: #ffffff;
          border-radius: var(--radius);
          border: 2px solid var(--stroke);
          display: flex;
          flex-direction: column;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          border-color: var(--accent);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
        }

        .accordion-header {
          cursor: pointer;
        }

        .dropdown-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          margin-right: -2px;
        }

        .card-title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .card-group {
          font-size: 16px;
        }

        .card-frequency {
          font-size: 12px;
          color: var(--accent-strong);
          background: rgba(26, 115, 232, 0.12);
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 600;
        }

        .card-actions {
          position: relative;
          display: flex;
          align-items: center;
        }

        .card-reset-btn {
          margin-right: 8px;
        }

        .icon-button {
          background: #ffffff;
          border: 1px solid var(--stroke);
          border-radius: 8px;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: background-color 0.15s, border-color 0.15s;
        }

        .icon-button:hover {
          background: #e8f0fe;
          border-color: var(--accent);
        }

        .icon {
          width: 18px;
          height: 18px;
          display: block;
        }

        .menu-popover {
          position: absolute;
          right: 0;
          top: 40px;
          background: #fff;
          border-radius: 12px;
          border: 1px solid var(--stroke);
          box-shadow: 0 12px 22px rgba(26, 26, 26, 0.12);
          z-index: 10;
        }

        .menu {
          display: flex;
          flex-direction: column;
          min-width: 180px;
        }

        .menu-item {
          border: none;
          background: transparent;
          padding: 10px 14px;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
        }

        .menu-item:hover {
          background: rgba(26, 115, 232, 0.12);
        }





        .reset-button {
          border: 1px solid rgba(26, 115, 232, 0.45);
          background: #e8f0fe;
          color: var(--accent-strong);
          font-weight: 600;
          font-size: 12px;
          padding: 8px 14px;
          border-radius: 999px;
          cursor: pointer;
        }

        .reset-button:hover {
          background: rgba(26, 115, 232, 0.18);
        }

        .questions-window {
          border: 1px solid var(--stroke);
          border-radius: 14px;
          background: #ffffff;
          padding: 16px;
          max-height: 520px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .board.blurred {
          filter: blur(6px);
          pointer-events: none;
          user-select: none;
        }

        .question-row {
          display: grid;
          grid-template-columns: 1fr 56px;
          gap: 12px;
          align-items: center;
        }

        .question-card {
          border: 1px solid var(--stroke);
          border-radius: 14px;
          padding: 12px 16px;
          background: #fff;
          min-height: 92px;
          display: flex;
          align-items: stretch;
        }

        /* Let the question image determine its own height (auto) */
        .question-image {
          width: 100%;
          height: auto;
          border-radius: 10px;
          overflow: hidden;
          background: #e8f0fe;
          display: block;
          padding: 8px;
        }

        .question-image img {
          display: block;
          max-width: 100%;
          height: auto;
          object-fit: contain;
          max-height: 70vh;
          margin: 0 auto;
        }

        .question-check {
          width: 32px;
          height: 32px;
          accent-color: var(--accent);
          cursor: pointer;
        }

        .questions-divider {
          height: 2px;
          border-radius: 999px;
          background: rgba(26, 26, 26, 0.12);
          margin: 8px 0;
        }

        .empty-state {
          text-align: center;
          color: var(--muted);
          padding: 12px 0;
        }

        @keyframes float-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 720px) {
          .page {
            padding: 0 0 48px;
          }

          .layout {
            padding: 24px 16px;
          }

          .section {
            min-height: 420px;
          }
        }
      `}</style>

      {loadError && <div className="image-placeholder">{loadError}</div>}

      <TopNavbar
        subjectId={subjectId}
        unitsData={unitsData}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        navigate={navigate}
      />

      <div className="layout">
        <div>
          <div className="board">
        <section className="section" id="unattempted">
          <SectionHeader
            title={STATUS_LABELS[STATUS.UNATTEMPTED]}
            count={groupedByStatus[STATUS.UNATTEMPTED].length}
          />
          {groupedByStatus[STATUS.UNATTEMPTED].map((group) => (
            <GroupCard
              key={`${selectedUnit}-${group.group_id}`}
              group={group}
              status={STATUS.UNATTEMPTED}
              onMove={handleMove}
              doneMap={doneMap}
              onToggleQuestion={handleToggleQuestion}
              onResetGroupChecks={handleResetGroupChecks}
            />
          ))}
        </section>

        <section className="section" id="first">
          <SectionHeader
            title={STATUS_LABELS[STATUS.FIRST]}
            count={groupedByStatus[STATUS.FIRST].length}
          />
          {groupedByStatus[STATUS.FIRST].map((group) => (
            <GroupCard
              key={`${selectedUnit}-${group.group_id}`}
              group={group}
              status={STATUS.FIRST}
              onMove={handleMove}
              doneMap={doneMap}
              onToggleQuestion={handleToggleQuestion}
              onResetGroupChecks={handleResetGroupChecks}
            />
          ))}
        </section>

        <section className="section" id="revision">
          <SectionHeader
            title={STATUS_LABELS[STATUS.REVISION]}
            count={groupedByStatus[STATUS.REVISION].length}
          />
          {groupedByStatus[STATUS.REVISION].map((group) => (
            <GroupCard
              key={`${selectedUnit}-${group.group_id}`}
              group={group}
              status={STATUS.REVISION}
              onMove={handleMove}
              doneMap={doneMap}
              onToggleQuestion={handleToggleQuestion}
              onResetGroupChecks={handleResetGroupChecks}
            />
          ))}
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}
