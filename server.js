const express = require("express")
const fs = require("fs").promises
const path = require("path")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3003
const NOTES_FILE = path.join(__dirname, "notes.json")

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(".")) // Serve static files from current directory
app.use(express.static("public")) // Serve static files from current directory

// Ensure notes.json exists
async function ensureNotesFile() {
  try {
    await fs.access(NOTES_FILE)
  } catch (error) {
    // File doesn't exist, create it with empty notes array
    await fs.writeFile(NOTES_FILE, JSON.stringify({ notes: [] }, null, 2))
  }
}

// API Routes
app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "web.html"));
})

app.get("/source", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "source.html"));
})

// Get all notes
app.get('/api/notes', async (req, res) => {
    try {
        await ensureNotesFile();
        const data = await fs.readFile(NOTES_FILE, 'utf8');
        const notes = JSON.parse(data);
        res.json(notes);
    } catch (error) {
        console.error('Error reading notes:', error);
        res.status(500).json({ success: false, message: 'Error reading notes' });
    }
});

// Add a new note
app.post('/api/notes', async (req, res) => {
    try {
        await ensureNotesFile();
        const { name, text, date, color } = req.body;
        
        // Validate input
        if (!name || !text) {
            return res.status(400).json({ success: false, message: 'Name and text are required' });
        }
        
        // Read existing notes
        const data = await fs.readFile(NOTES_FILE, 'utf8');
        const notesData = JSON.parse(data);
        
        // Add new note
        const newNote = {
            id: Date.now().toString(),
            name,
            text,
            date: date || new Date().toISOString(),
            color
        };
        
        notesData.notes.push(newNote);
        
        // Write updated notes back to file
        await fs.writeFile(NOTES_FILE, JSON.stringify(notesData, null, 2));
        
        res.status(201).json({ success: true, note: newNote });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ success: false, message: 'Error adding note' });
    }
});

// Reset notes
app.get('/api/resetnotes', async (req, res) => {
    try {
        await fs.writeFile(NOTES_FILE, JSON.stringify({ notes: [] }, null, 2));
        res.status(200).json({ success: true, message: 'Notes reset successfully' });
    } catch (error) {
        console.error('Error resetting notes:', error);
        res.status(500).json({ success: false, message: 'Error resetting notes' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
