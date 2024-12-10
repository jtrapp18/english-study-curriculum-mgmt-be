const { v4: uuidv4 } = require('uuid');
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Path to the db.json file
const dbPath = path.join(__dirname, '../db.json');

const { promises: fsPromises } = require('fs');

const readDb = async () => {
  try {
    const data = await fsPromises.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } 
  catch (err) {
    console.error('Error reading db.json:', err);
    throw new Error('Failed to read database');
  }
};

const writeDb = async (newData) => {
  try {
    await fsPromises.writeFile(dbPath, JSON.stringify(newData, null, 2), 'utf8');
  } 
  catch (err) {
    console.error('Error writing to db.json:', err);
    throw new Error('Failed to update database');
  }
};

router.get('/:dbKey/:id', async (req, res) => {
  const { dbKey, id } = req.params;
  const embedKey = req.query._embed; // Get _embed query parameter

  try {
    const db = await readDb(); // Dynamically read your database

    // Ensure dbKey exists in database
    if (!db[dbKey]) {
      return res.status(404).json({ error: 'Database key not found' });
    }

    // Find the requested item
    const item = db[dbKey].find(item => item.id == id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Perform embedding if _embed query exists
    if (embedKey) {
      // Ensure embedKey exists in database
      if (db[embedKey]) {
        const singularKey = dbKey.endsWith('s') ? dbKey.slice(0, -1) : dbKey;
        const parentId = `${singularKey}Id`
        const embeddedData = {
          ...item,
          [embedKey]: db[embedKey].filter(embedItem => embedItem[parentId] === item.id) || [],
        };
        return res.status(200).json(embeddedData);
      } else {
        return res.status(400).json({ error: `Embed key '${embedKey}' does not exist in the database.` });
      }
    }

    // Return the regular item if embedding is not requested
    return res.status(200).json(item);
  } 
  catch (error) {
    console.error('Error reading database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:dbKey', async (req, res) => {
  const { dbKey } = req.params;
  const embedKey = req.query._embed; // Get _embed query parameter
  const searchParams = req.query; // Extract all query parameters

  const searchKey = req.query.searchKey;
  const searchValue = req.query.searchValue;

  try {
    const db = await readDb(); // Dynamically read your database

    if (!db[dbKey]) {
      return res.status(404).json({ error: 'Database key does not exist' });
    }

    let data = db[dbKey];
    console.log(data);

    // Perform search based on query string
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== '_embed') { // Exclude _embed key from being part of filtering
        data = data.filter(item => item[key] === value);
      }
    }

    // Perform embedding if _embed query exists
    if (embedKey) {
      const singularKey = dbKey.endsWith('s') ? dbKey.slice(0, -1) : dbKey;
      const parentId = `${singularKey}Id`
      const embeddedData = data.map(item => ({
        ...item,
        [embedKey]: db[embedKey].filter(embedItem => embedItem[parentId] === item.id),
      }));
      return res.status(200).json(embeddedData);
    }

    if (searchKey && searchValue) {
      const result = db[dbKey].filter(item => item[searchKey] === searchValue);
      return res.status(200).json(result);
    }

    return res.status(200).json(data);
  } 
  catch (error) {
    console.error('Error reading database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update data for a specific dbKey (Full replacement)
router.post('/:dbKey', async (req, res) => {
  const { dbKey } = req.params;
  const newData = {
    ...req.body,
    id: uuidv4()
    };

  try {
    const db = await readDb();
    
    // Ensure the dbKey exists as an array in your database
    if (!Array.isArray(db[dbKey])) {
      db[dbKey] = []; // Initialize as an empty array if not already present
    }

    // Push the new object into the array
    db[dbKey].push(newData);

    await writeDb(db);

    res.status(200).json(newData);
  } 
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to partially update data for a specific dbKey (PATCH)
router.patch('/:dbKey', async (req, res) => {
  const { dbKey } = req.params;
  const updates = req.body;
  
  try {
    const db = await readDb();

    if (!db[dbKey]) {
      return res.status(404).json({ error: `No data found for key: ${dbKey}` });
    }

    const item = db[dbKey].find(item => item.id === updates.id);
    if (!item) {
      return res.status(404).json({ error: `Item not found for id: ${updates.id}` });
    }

    Object.assign(item, updates); // Apply updates to the item
    await writeDb(db);

    res.status(200).json({ message: 'Data updated successfully', data: item });
  } 
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to delete data for a specific dbKey
router.delete('/:dbKey', async (req, res) => {
  const { dbKey } = req.params;

  try {
    const db = await readDb();

    if (!db[dbKey]) {
      return res.status(404).json({ error: `No data found for key: ${dbKey}` });
    }

    delete db[dbKey];
    await writeDb(db);

    res.status(200).json({ message: `Data deleted for key: ${dbKey}` });
  } 
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
