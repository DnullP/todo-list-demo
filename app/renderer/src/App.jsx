import React, { useEffect, useState } from 'react';
import { useTaskStore } from './stores/useTaskStore';
import './styles.css';

function formatDate(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(); } catch (e) { return iso; }
}

function PriorityBadge({ p }) {
    const cls = p === 'high' ? 'prio-high' : p === 'low' ? 'prio-low' : 'prio-medium';
    return <span className={`priority ${cls}`}>{p}</span>;
}

export default function App() {
    const { tasks, stats, load, addTask, completeTask } = useTaskStore();
    const [title, setTitle] = useState('');

    useEffect(() => {
        load();
        if (window.todoApi && window.todoApi.onTaskDue) {
            const off = window.todoApi.onTaskDue((id) => {
                // simple feedback when a task becomes due
                console.log('task due', id);
                load();
            });
            return off;
        }
    }, []);

    const onAdd = async () => {
        const value = title.trim();
        if (!value) return;
        await addTask({ title: value, priority: 'medium' });
        setTitle('');
    };

    return (
        <div className="app-container">
            <div className="header">
                <div className="title">
                    <h1>Good Tasks</h1>
                    <p>Simple, local-first todo powered by Electron</p>
                </div>
                <div className="stats">Total {stats.total} • Done {stats.completed} • Overdue {stats.overdue}</div>
            </div>

            <div className="controls">
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" />
                <button className="btn" onClick={onAdd}>Add</button>
                <button className="btn ghost" onClick={() => load()}>Refresh</button>
            </div>

            {tasks.length === 0 ? (
                <div className="empty">No tasks yet — add your first task above.</div>
            ) : (
                <div className="task-list">
                    {tasks.map((t) => (
                        <div key={t.id} className="task-card">
                            <div className="task-top">
                                <div>
                                    <div className="task-title">{t.title}</div>
                                    <div className="task-meta">{t.description || <span className="muted">No description</span>}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <PriorityBadge p={t.priority} />
                                    <div className="task-meta" style={{ marginTop: 6 }}>{t.dueAt ? formatDate(t.dueAt) : ''}</div>
                                </div>
                            </div>

                            <div className="task-actions">
                                {t.status !== 'completed' ? (
                                    <button className="small complete-btn" onClick={() => completeTask(t.id)}>Mark done</button>
                                ) : (
                                    <div className="muted">Completed {t.completedAt ? formatDate(t.completedAt) : ''}</div>
                                )}
                                <div style={{ flex: 1 }} />
                                <div className="task-meta">{t.tags && t.tags.length ? t.tags.join(', ') : ''}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}