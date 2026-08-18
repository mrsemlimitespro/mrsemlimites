-- POLÍTICAS DE STORAGE PARA EXT_V17_UPLOADS
-- Permite que o service_role gerencie tudo.

CREATE POLICY "Admin can manage v17 uploads"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'ext_v17_uploads')
WITH CHECK (bucket_id = 'ext_v17_uploads');
