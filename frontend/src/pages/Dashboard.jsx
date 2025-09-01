import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user] = useState(location.state?.user || { name: 'Jonas', email: 'xxxx@xx.com' });
    const [notes, setNotes] = useState([]);
    const [newNoteText, setNewNoteText] = useState('');

    // Fetch notes on load
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/notes/${user.email}`);
                setNotes(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchNotes();
    }, [user.email]);

    const handleCreateNote = async () => {
        if (!newNoteText.trim()) return;
        try {
            const res = await axios.post('http://localhost:3000/notes', { email: user.email, text: newNoteText });
            setNotes([...notes, res.data.note]);
            setNewNoteText('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteNote = (id) => {
        setNotes(notes.filter(note => note._id !== id));
        // Optional: add backend delete API later
    };

    const handleSignOut = () => navigate('/signin');

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <span className="dashboard-title">Dashboard</span>
                <button onClick={handleSignOut} className="signout-button">Sign Out</button>
            </div>

            <div className="dashboard-card">
                <div className="welcome-section">
                    <h2>Welcome, {user.name}!</h2>
                    <p>Email: {user.email}</p>
                </div>

                <div className="create-note-section">
                    <input
                        type="text"
                        placeholder="Type your new note..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="new-note-input" // <-- Add this
                    />
                    <button
                        onClick={handleCreateNote}
                        className="create-note-button" // <-- Add this
                    >
                        Create Note
                    </button>
                </div>


                <div className="notes-list-section">
                    {notes.map(note => (
                        <div key={note._id} className="note-item">
                            <span>{note.text}</span>
                            <button onClick={() => handleDeleteNote(note._id)}>🗑️</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
