-- Create recipes table
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients TEXT NOT NULL, -- JSON array stored as string
  cook_time TEXT,
  recipe_text TEXT,
  thumbnail_url TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Create FTS5 virtual table for full-text search (supports Korean text)
CREATE VIRTUAL TABLE recipes_fts USING fts5(
  id UNINDEXED,
  name,
  ingredients,
  content=recipes,
  content_rowid=rowid
);

-- Trigger to keep FTS index in sync on INSERT
CREATE TRIGGER recipes_ai AFTER INSERT ON recipes BEGIN
  INSERT INTO recipes_fts(rowid, id, name, ingredients)
  VALUES (new.rowid, new.id, new.name, new.ingredients);
END;

-- Trigger to keep FTS index in sync on UPDATE
CREATE TRIGGER recipes_au AFTER UPDATE ON recipes BEGIN
  UPDATE recipes_fts SET name = new.name, ingredients = new.ingredients
  WHERE rowid = new.rowid;
END;

-- Trigger to keep FTS index in sync on DELETE
CREATE TRIGGER recipes_ad AFTER DELETE ON recipes BEGIN
  DELETE FROM recipes_fts WHERE rowid = old.rowid;
END;

-- Create index on created_at for sorting
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
