-- Manually trigger initial sync for existing profiles
UPDATE user_profiles 
SET lead_stages = lead_stages 
WHERE true;