/**
 * Self-Healing Admin Panel
 * Full control centre for the self-healing engine.
 * Admin must be authenticated to toggle healing or change config.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    isSelfHealingEnabled,
    setSelfHealingEnabled,
    getSelfHealingConfig,
    saveSelfHealingConfig,
    getHealingLog,
    clearHealingLog,
    calculateHealthScore,
    getHealthHistory,
    getLastHealTime,
    getContentSnapshots,
    restoreFromSnapshot,
    runHealingCycle,
    isHealingRunning,
    subscribe,
    DEFAULT_CONFIG,
} from '../../utils/selfHealing';

// ─── Utility helpers ───────────────────────────────────────────────────────

function timeAgo(isoString) {
    if (!isoString) return 'Never';
    const diff = Date.now() - new Date(isoString).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function severityColor(severity) {
    switch (severity) {
        case 'success': return 'text-green-400 bg-green-400/10 border-green-400/20';
        case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        case 'error':   return 'text-red-400 bg-red-400/10 border-red-400/20';
        default:        return 'text-gray-400 bg-white/5 border-white/10';
    }
}

function healthColor(score) {
    if (score >= 80) return '#4ade80';
    if (score >= 55) return '#facc15';
    return '#f87171';
}

function typeIcon(type) {
    switch (type) {
        case 'content_update':  return '✏️';
        case 'data_repair':     return '🔧';
        case 'error_recovery':  return '🛟';
        case 'snapshot':        return '📸';
        default:                return '⚙️';
    }
}

// ─── Sub-components ────────────────────────────────────────────────────────

function HealthGauge({ score, status }) {
    const color = healthColor(score);
    const arc = Math.round((score / 100) * 283); // circumference ≈ 283

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke={color} strokeWidth="8"
                        strokeDasharray={`${arc} 283`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.8s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-display font-bold" style={{ color }}>{score}%</span>
                    <span className="text-xs text-gray-500 capitalize">{status}</span>
                </div>
            </div>
            <span className="text-xs text-gray-500">Overall Health</span>
        </div>
    );
}

function Toggle({ enabled, onToggle, loading }) {
    return (
        <button
            onClick={onToggle}
            disabled={loading}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${
                enabled ? 'bg-green-500' : 'bg-white/10 border border-white/20'
            } disabled:opacity-50`}
            title={enabled ? 'Click to pause self-healing' : 'Click to enable self-healing'}
        >
            <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${
                    enabled ? 'translate-x-8' : 'translate-x-1'
                }`}
            />
        </button>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function SelfHealingPanel() {
    const [enabled, setEnabled]         = useState(isSelfHealingEnabled);
    const [config, setConfig]           = useState(getSelfHealingConfig);
    const [log, setLog]                 = useState(getHealingLog);
    const [health, setHealth]           = useState(() => calculateHealthScore());
    const [lastHeal, setLastHeal]       = useState(getLastHealTime);
    const [snapshots, setSnapshots]     = useState(getContentSnapshots);
    const [running, setRunning]         = useState(isHealingRunning);
    const [toggleLoading, setToggle]    = useState(false);
    const [saveMsg, setSaveMsg]         = useState('');
    const [activeTab, setActiveTab]     = useState('overview');
    const [error, setError]             = useState('');
    const [expandedLog, setExpandedLog] = useState(null);
    const [configDraft, setConfigDraft] = useState(getSelfHealingConfig);

    // Refresh all state from engine
    const refresh = useCallback(() => {
        setEnabled(isSelfHealingEnabled());
        setLog(getHealingLog());
        setHealth(calculateHealthScore());
        setLastHeal(getLastHealTime());
        setSnapshots(getContentSnapshots());
        setRunning(isHealingRunning());
        setConfig(getSelfHealingConfig());
    }, []);

    // Subscribe to engine notifications
    useEffect(() => {
        const unsub = subscribe(refresh);
        const interval = setInterval(refresh, 15000); // poll every 15s as backup
        return () => { unsub(); clearInterval(interval); };
    }, [refresh]);

    // ── Toggle self-healing ──
    const handleToggle = useCallback(async () => {
        setToggle(true);
        setError('');
        try {
            setSelfHealingEnabled(!enabled);
            setEnabled(!enabled);
        } catch (err) {
            setError(err.message || 'Failed to toggle self-healing');
        } finally {
            setToggle(false);
        }
    }, [enabled]);

    // ── Emergency stop ──
    const handleEmergencyStop = useCallback(() => {
        setError('');
        try {
            setSelfHealingEnabled(false);
            setEnabled(false);
        } catch (err) {
            setError(err.message || 'Failed to stop self-healing');
        }
    }, []);

    // ── Manual trigger ──
    const handleManualRun = useCallback(async () => {
        setError('');
        setRunning(true);
        try {
            await runHealingCycle(true);
        } catch (err) {
            setError(err.message || 'Cycle failed');
        } finally {
            setRunning(false);
            refresh();
        }
    }, [refresh]);

    // ── Save config ──
    const handleSaveConfig = useCallback(() => {
        setError('');
        try {
            saveSelfHealingConfig(configDraft);
            setConfig(getSelfHealingConfig());
            setSaveMsg('Saved!');
            setTimeout(() => setSaveMsg(''), 2000);
        } catch (err) {
            setError(err.message || 'Failed to save config');
        }
    }, [configDraft]);

    // ── Clear log ──
    const handleClearLog = useCallback(() => {
        setError('');
        try {
            clearHealingLog();
            setLog([]);
        } catch (err) {
            setError(err.message || 'Failed to clear log');
        }
    }, []);

    // ── Restore snapshot ──
    const handleRestore = useCallback((page, snapshotId) => {
        setError('');
        try {
            const ok = restoreFromSnapshot(page, snapshotId);
            if (ok) {
                setSaveMsg(`Restored ${page} from snapshot`);
                setTimeout(() => setSaveMsg(''), 3000);
                refresh();
            }
        } catch (err) {
            setError(err.message || 'Restore failed');
        }
    }, [refresh]);

    const tabs = ['overview', 'log', 'config', 'snapshots'];

    return (
        <div>
            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                        <span>🔁</span> Self-Healing Engine
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Continuously monitors and auto-repairs site content. Only you (admin) can stop it.
                    </p>
                </div>

                {/* Master Toggle */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono uppercase tracking-wider ${enabled ? 'text-green-400' : 'text-gray-500'}`}>
                            {enabled ? 'Active' : 'Paused'}
                        </span>
                        <Toggle enabled={enabled} onToggle={handleToggle} loading={toggleLoading} />
                    </div>
                    {enabled && (
                        <button
                            onClick={handleEmergencyStop}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                            ⛔ Emergency Stop
                        </button>
                    )}
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}
            {saveMsg && (
                <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                    ✓ {saveMsg}
                </div>
            )}

            {/* Status bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Status',      value: enabled ? (running ? 'Running…' : 'Watching') : 'Paused',
                      color: enabled ? (running ? '#facc15' : '#4ade80') : '#6b7280' },
                    { label: 'Last Healed', value: timeAgo(lastHeal), color: '#d1d5db' },
                    { label: 'Health',      value: `${health.overall}%`,  color: healthColor(health.overall) },
                    { label: 'Log Entries', value: log.length,             color: '#d1d5db' },
                ].map(s => (
                    <div key={s.label} className="glassmorphism rounded-xl border border-white/10 p-4 text-center">
                        <div className="text-xl font-display font-bold" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 border-b border-white/10">
                {tabs.map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                        className={`px-4 py-2 text-sm capitalize rounded-t-lg transition-all ${
                            activeTab === t
                                ? 'text-white bg-white/10 border-b-2 border-white'
                                : 'text-gray-500 hover:text-white'
                        }`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* ─── OVERVIEW TAB ─── */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex gap-6 flex-wrap items-start">
                            {/* Health gauge */}
                            <div className="glassmorphism rounded-2xl border border-white/10 p-6 flex flex-col items-center gap-4 min-w-[180px]">
                                <HealthGauge score={health.overall} status={health.status} />
                                <div className="w-full space-y-2">
                                    {Object.entries(health.pages || {}).map(([page, score]) => (
                                        <div key={page} className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 w-16 capitalize">{page}</span>
                                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${score}%`, backgroundColor: healthColor(score) }}
                                                />
                                            </div>
                                            <span className="text-xs font-mono" style={{ color: healthColor(score) }}>{score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex-1 space-y-3 min-w-[220px]">
                                <div className="glassmorphism rounded-2xl border border-white/10 p-5">
                                    <h4 className="text-sm font-semibold text-white mb-3">Controls</h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={handleManualRun}
                                            disabled={running}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-200 disabled:opacity-50 transition-all"
                                        >
                                            {running ? (
                                                <>
                                                    <span className="inline-block animate-spin">⟳</span> Healing…
                                                </>
                                            ) : '▶ Run Cycle Now'}
                                        </button>
                                        <button
                                            onClick={handleEmergencyStop}
                                            disabled={!enabled}
                                            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-400/20 hover:bg-red-400/10 disabled:opacity-30 transition-all"
                                        >
                                            ⛔ Stop All Modifications
                                        </button>
                                    </div>
                                </div>

                                <div className="glassmorphism rounded-2xl border border-white/10 p-5">
                                    <h4 className="text-sm font-semibold text-white mb-3">Current Config</h4>
                                    <div className="space-y-1 text-xs font-mono text-gray-400">
                                        <div>Interval: <span className="text-white">{config.interval} min</span></div>
                                        <div>Intensity: <span className="text-white capitalize">{config.healingIntensity}</span></div>
                                        <div>AI Refresh: <span className="text-white">{config.autoRefreshContent ? 'On' : 'Off'}</span></div>
                                        <div>Data Repair: <span className="text-white">{config.autoRepairData ? 'On' : 'Off'}</span></div>
                                        <div>Target pages: <span className="text-white">{config.targetPages?.length || 0}</span></div>
                                    </div>
                                </div>

                                {/* Recent log (last 5) */}
                                <div className="glassmorphism rounded-2xl border border-white/10 p-5">
                                    <h4 className="text-sm font-semibold text-white mb-3">Recent Activity</h4>
                                    {log.length === 0 ? (
                                        <p className="text-xs text-gray-600">No activity yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {log.slice(0, 5).map(entry => (
                                                <div key={entry.id} className={`text-xs px-3 py-2 rounded-lg border ${severityColor(entry.severity)}`}>
                                                    <span className="mr-1">{typeIcon(entry.type)}</span>
                                                    {entry.message}
                                                    <span className="ml-1 opacity-50">{timeAgo(entry.timestamp)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ─── LOG TAB ─── */}
                {activeTab === 'log' && (
                    <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-400">{log.length} entries</span>
                            <button onClick={handleClearLog}
                                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                Clear Log
                            </button>
                        </div>
                        {log.length === 0 ? (
                            <div className="glassmorphism rounded-2xl border border-white/10 p-12 text-center text-gray-600">
                                <div className="text-4xl mb-2">📋</div>
                                No log entries yet. Start a healing cycle to see activity.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                                {log.map(entry => (
                                    <div key={entry.id}>
                                        <button
                                            onClick={() => setExpandedLog(expandedLog === entry.id ? null : entry.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${severityColor(entry.severity)} hover:opacity-90`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="flex-shrink-0">{typeIcon(entry.type)}</span>
                                                    <span className="text-xs truncate">{entry.message}</span>
                                                </div>
                                                <span className="text-xs opacity-50 flex-shrink-0">{timeAgo(entry.timestamp)}</span>
                                            </div>
                                        </button>
                                        {expandedLog === entry.id && entry.details && (
                                            <div className="mt-1 px-4 py-3 bg-black/30 rounded-xl border border-white/5 text-xs font-mono text-gray-400 whitespace-pre-wrap">
                                                {JSON.stringify(entry.details, null, 2)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ─── CONFIG TAB ─── */}
                {activeTab === 'config' && (
                    <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="glassmorphism rounded-2xl border border-white/10 p-6 space-y-5">
                            <h3 className="text-sm font-semibold text-white">Engine Configuration</h3>

                            {/* Interval */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Healing Interval</label>
                                <select
                                    value={configDraft.interval}
                                    onChange={e => setConfigDraft(d => ({ ...d, interval: Number(e.target.value) }))}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                >
                                    {[5, 10, 15, 30, 60, 180, 360, 720, 1440].map(v => (
                                        <option key={v} value={v} className="bg-gray-900">
                                            {v < 60 ? `Every ${v} minutes` : v === 60 ? 'Every hour' : v < 1440 ? `Every ${v / 60} hours` : 'Daily'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Healing intensity */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Healing Intensity</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['minimal', 'moderate', 'aggressive'].map(level => (
                                        <button key={level}
                                            onClick={() => setConfigDraft(d => ({ ...d, healingIntensity: level }))}
                                            className={`py-2.5 rounded-xl text-sm capitalize transition-all ${
                                                configDraft.healingIntensity === level
                                                    ? 'bg-white text-black font-bold'
                                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    {configDraft.healingIntensity === 'minimal' && 'Only fills completely empty content sections.'}
                                    {configDraft.healingIntensity === 'moderate' && 'Fills empty and short content sections.'}
                                    {configDraft.healingIntensity === 'aggressive' && 'Refreshes all content sections on every cycle.'}
                                </p>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-3">
                                {[
                                    { key: 'autoRefreshContent', label: 'AI Content Refresh', desc: 'Use Claude AI to auto-update page content' },
                                    { key: 'autoRepairData',     label: 'Data Integrity Repair', desc: 'Detect and remove corrupted localStorage entries' },
                                ].map(({ key, label, desc }) => (
                                    <div key={key} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/3 border border-white/10">
                                        <div>
                                            <div className="text-sm text-white">{label}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                                        </div>
                                        <Toggle
                                            enabled={configDraft[key]}
                                            onToggle={() => setConfigDraft(d => ({ ...d, [key]: !d[key] }))}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Target pages */}
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">Target Pages</label>
                                <div className="flex flex-wrap gap-2">
                                    {['home', 'about', 'products', 'careers', 'contact'].map(page => {
                                        const active = (configDraft.targetPages || []).includes(page);
                                        return (
                                            <button key={page}
                                                onClick={() => setConfigDraft(d => ({
                                                    ...d,
                                                    targetPages: active
                                                        ? d.targetPages.filter(p => p !== page)
                                                        : [...(d.targetPages || []), page],
                                                }))}
                                                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                                                    active
                                                        ? 'bg-white text-black font-semibold'
                                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Max log */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Max Log Entries</label>
                                <input
                                    type="number" min="20" max="500"
                                    value={configDraft.maxLogEntries}
                                    onChange={e => setConfigDraft(d => ({ ...d, maxLogEntries: Number(e.target.value) }))}
                                    className="w-32 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={handleSaveConfig}
                                    className="px-6 py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-200 transition-all">
                                    {saveMsg || 'Save Configuration'}
                                </button>
                                <button onClick={() => setConfigDraft(DEFAULT_CONFIG)}
                                    className="px-6 py-3 rounded-xl text-sm text-gray-400 border border-white/10 hover:text-white transition-all">
                                    Reset Defaults
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ─── SNAPSHOTS TAB ─── */}
                {activeTab === 'snapshots' && (
                    <motion.div key="snapshots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="text-xs text-gray-500 mb-4">
                            Snapshots are taken automatically before any auto-modification. Restore to roll back changes.
                        </p>
                        {Object.keys(snapshots).length === 0 ? (
                            <div className="glassmorphism rounded-2xl border border-white/10 p-12 text-center text-gray-600">
                                <div className="text-4xl mb-2">📸</div>
                                No snapshots yet. They will appear after the first healing cycle.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(snapshots).map(([page, snaps]) => (
                                    <div key={page} className="glassmorphism rounded-2xl border border-white/10 p-5">
                                        <h4 className="text-sm font-semibold text-white capitalize mb-3">{page} page</h4>
                                        <div className="space-y-2">
                                            {snaps.map((snap, i) => (
                                                <div key={snap.id} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                                    <div>
                                                        <span className="text-xs text-gray-300">{timeAgo(snap.timestamp)}</span>
                                                        {i === 0 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">latest</span>}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRestore(page, snap.id)}
                                                        className="text-xs px-3 py-1.5 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                                                    >
                                                        Restore
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
