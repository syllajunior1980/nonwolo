-- Activer RLS et autoriser tout le monde à lire/écrire
ALTER TABLE adherents ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "allow_all_adherents" ON adherents;
DROP POLICY IF EXISTS "allow_all_villages" ON villages;

-- Créer policies ouvertes (tout le monde peut lire et écrire)
CREATE POLICY "allow_all_adherents" ON adherents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_villages" ON villages FOR ALL USING (true) WITH CHECK (true);

-- Ajouter les villages de base si la table est vide
INSERT INTO villages (id, nom, region)
SELECT * FROM (VALUES
  ('v1', 'Nonwolo', 'Centre'),
  ('v2', 'Gnegre', 'Nord'),
  ('v3', 'Kakolo', 'Est'),
  ('v4', 'Zologo', 'Ouest'),
  ('v5', 'Tiebila', 'Sud')
) AS t(id, nom, region)
WHERE NOT EXISTS (SELECT 1 FROM villages LIMIT 1);
