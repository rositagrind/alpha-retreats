-- Storage RLS policies for retreat-images bucket
-- Run this in the Supabase SQL Editor

DROP POLICY IF EXISTS "Authenticated users can upload retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete retreat images" ON storage.objects;

CREATE POLICY "Authenticated users can upload retreat images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'retreat-images');

CREATE POLICY "Authenticated users can update retreat images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'retreat-images');

CREATE POLICY "Authenticated users can delete retreat images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'retreat-images');
