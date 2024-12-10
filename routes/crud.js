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


// Route to get data by dbKey
router.get('/:dbKey', async (req, res) => {
  const { dbKey } = req.params;

  try {
    const db = await readDb();

    if (!db[dbKey]) {
      return res.status(404).json({ error: `No data found for key: ${dbKey}` });
    }

    res.status(200).json(db[dbKey]);
  } 
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch specific data by dbKey and ID
router.get('/:dbKey/:id', async (req, res) => {
  const { dbKey, id } = req.params;

  if (!db[dbKey] || !db[dbKey].find(item => item.id == id)) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const item = db[dbKey].find(item => item.id == id);
  res.status(200).json(item);
});

router.get('/_embed/:dbKey', async (req, res) => {
  const { dbKey } = req.params;
  const embedKey = req.query._embed;

  if (!db[dbKey]) {
    return res.status(404).json({ error: 'Database key does not exist' });
  }

  if (embedKey) {
    const embeddedData = db[dbKey].map(item => ({
      ...item,
      [embedKey]: db[embedKey].filter(embedItem => embedItem.parentId === item.id),
    }));

    return res.status(200).json(embeddedData);
  }

  return res.status(200).json(db[dbKey]);
});

router.get('/_embed/:dbKey/:id', async (req, res) => {
  const { dbKey, id } = req.params;
  const embedKey = req.query._embed;
  
  if (!db[dbKey] || !db[dbKey].find(item => item.id == id)) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const item = db[dbKey].find(item => item.id == id);

  if (embedKey) {
    const embeddedData = {
      ...item,
      [embedKey]: db[embedKey].filter(embedItem => embedItem.parentId === item.id),
    };

    return res.status(200).json(embeddedData);
  }

  return res.status(200).json(item);
});

// Route to update data for a specific dbKey (Full replacement)
router.post('/:dbKey', async (req, res) => {
  const { dbKey } = req.params;
  const newData = req.body;

  try {
    const db = await readDb();
    db[dbKey] = newData;
    await writeDb(db);

    res.status(200).json({ message: 'Data updated successfully', data: db[dbKey] });
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

    db[dbKey] = { ...db[dbKey], ...updates };
    await writeDb(db);

    res.status(200).json({ message: 'Data updated successfully', data: db[dbKey] });
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

router.get('search/:dbKey', async (req, res) => {
  const { dbKey } = req.params;
  const searchKey = req.query.searchKey;
  const searchValue = req.query.searchValue;

  if (!db[dbKey]) {
    return res.status(404).json({ error: 'Database key does not exist' });
  }

  if (searchKey && searchValue) {
    const result = db[dbKey].filter(item => item[searchKey] === searchValue);
    return res.status(200).json(result);
  }

  return res.status(200).json(db[dbKey]);
});

module.exports = router;
