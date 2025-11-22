import React, { useEffect, useState } from 'react';
import { useTaskStore } from './stores/useTaskStore';

export default function App() {
    const { tasks, stats, load, addTask, completeTask } = useTaskStore();
    const [title, setTitle] = useState('');

    useEffect(() => {
        load();
        // subscribe to due notifications
        if (window.todoApi && window.todoApi.onTaskDue) {
            const off = window.todoApi.onTaskDue((id) => {
                console.log('task due', id);
                load();
            });
            return off;
        }
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <h1>Todo List</h1>
            <div style={{ marginBottom: 12 }}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task title" />
                <button onClick={async () => { if (title.trim()) { await addTask({ title: title.trim() }); setTitle(''); } }}>Add</button>
            </div>

            <div style={{ marginBottom: 12 }}>
                <strong>Stats:</strong> total {stats.total} • completed {stats.completed} • overdue {stats.overdue} • today {stats.today}
            </div>

            <ul>
                {tasks.map((t) => (
                    <li key={t.id} style={{ marginBottom: 8 }}>
                        <span style={{ marginRight: 8 }}>{t.title}</span>
                        <small style={{ color: '#666' }}>{t.dueAt ? new Date(t.dueAt).toLocaleString() : ''}</small>
                        {t.status !== 'completed' && (
                            <button style={{ marginLeft: 8 }} onClick={() => completeTask(t.id)}>Complete</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}