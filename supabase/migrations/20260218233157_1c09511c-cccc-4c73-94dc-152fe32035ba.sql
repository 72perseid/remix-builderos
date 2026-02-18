CREATE POLICY "Users can delete own artifacts"
  ON artifacts FOR DELETE
  USING (auth.uid() = user_id);