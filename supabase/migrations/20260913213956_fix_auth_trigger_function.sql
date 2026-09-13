/*
  # Fix Auth Trigger Function

  1. Problem
    - The `handle_new_user` trigger function has a mutable `search_path`, flagged by the security advisor.
    - The function is executable by `anon` and `authenticated` roles via the REST API, which is unnecessary
      since it should only be called by the database trigger on `auth.users`.
    - These issues can cause the signup trigger to fail or behave unpredictably.

  2. Changes
    - Recreate `handle_new_user` with `SET search_path = public` to lock the search path.
    - Revoke `EXECUTE` from `anon` and `authenticated` roles so the function can only be called by the trigger.
    - The trigger itself remains unchanged — it still fires `AFTER INSERT ON auth.users`.
*/

-- Recreate the function with a locked search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);

  RETURN new;
END;
$function$;

-- Revoke execute from anon and authenticated — only the trigger should call this
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;