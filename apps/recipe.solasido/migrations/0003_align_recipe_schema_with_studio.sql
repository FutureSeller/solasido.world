DROP TRIGGER IF EXISTS recipes_ai;
DROP TRIGGER IF EXISTS recipes_au;
DROP TRIGGER IF EXISTS recipes_ad;
DROP TABLE IF EXISTS recipes_fts;
DROP TABLE IF EXISTS recipe_tags;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;

CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cook_time TEXT,
  recipe_text TEXT,
  source_url TEXT,
  thumbnail_url TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE recipe_tags (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  display_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE recipe_ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  measure_text TEXT,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags(recipe_id, sort_order, created_at);
CREATE INDEX idx_recipe_tags_tag ON recipe_tags(tag);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id, sort_order, created_at);
CREATE INDEX idx_recipe_ingredients_name ON recipe_ingredients(name);

INSERT INTO recipes (
  id,
  name,
  cook_time,
  recipe_text,
  source_url,
  thumbnail_url,
  created_at,
  updated_at
) VALUES (
  '30216edffb5d807682b4d3a08db02557',
  '소고기 마늘쫑 볶음',
  '약 15분',
  '1. 세척한 마늘쫑 한 단 총총총 썰기
2. 기름 두른 팬에 5분 볶기
3. 다진 소고기 350g 넣기
4. 맛술 1T, 다진 마늘 1T, 간장 5T 넣고 볶기
5. 후추 뿌려서 마무리',
  NULL,
  '/images/소고기 마늘쫑 볶음_30216edf.jpg',
  unixepoch(),
  unixepoch()
);

INSERT INTO recipe_ingredients (id, recipe_id, name, sort_order) VALUES
  ('30216edffb5d807682b4d3a08db02557-ing-1', '30216edffb5d807682b4d3a08db02557', '마늘쫑', 0),
  ('30216edffb5d807682b4d3a08db02557-ing-2', '30216edffb5d807682b4d3a08db02557', '다진 소고기', 1),
  ('30216edffb5d807682b4d3a08db02557-ing-3', '30216edffb5d807682b4d3a08db02557', '다진 마늘', 2),
  ('30216edffb5d807682b4d3a08db02557-ing-4', '30216edffb5d807682b4d3a08db02557', '맛술', 3),
  ('30216edffb5d807682b4d3a08db02557-ing-5', '30216edffb5d807682b4d3a08db02557', '간장', 4),
  ('30216edffb5d807682b4d3a08db02557-ing-6', '30216edffb5d807682b4d3a08db02557', '후추', 5);
