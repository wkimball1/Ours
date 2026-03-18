-- Create a public bucket for avatar images (1 MB limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  1048576,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload/update/delete only their own avatar
-- Avatar path format: {user_id}/avatar
CREATE POLICY "users can manage own avatar"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can read avatars (they are referenced in profile cards)
CREATE POLICY "avatars are publicly readable"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
