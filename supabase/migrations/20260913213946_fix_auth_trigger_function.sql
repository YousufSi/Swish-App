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