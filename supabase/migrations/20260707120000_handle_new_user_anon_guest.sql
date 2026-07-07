-- Gör handle_new_user()-triggern säker för anonyma användare (gäst-checkout).
-- Anonyma auth.users saknar e-post och metadata → tidigare kraschade profil-
-- insert:en (profiles.email/name är NOT NULL) och signInAnonymously gav 500.
-- Ger anon-användare en unik platshållar-e-post (deras riktiga e-post ligger
-- på ordern) och namnet "Gäst".

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email, name, business, company_name, role, marketing_consent)
  values (
    new.id,
    coalesce(nullif(new.email, ''), new.id::text),
    coalesce(
      nullif(new.raw_user_meta_data->>'name',''),
      nullif(split_part(coalesce(new.email,''),'@',1),''),
      'Gäst'
    ),
    coalesce((new.raw_user_meta_data->>'business')::boolean, false),
    nullif(new.raw_user_meta_data->>'company_name',''),
    case when new.email is not null
              and exists (select 1 from public.admin_emails a where a.email = new.email)
         then 'admin' else 'customer' end,
    coalesce((new.raw_user_meta_data->>'marketing_consent')::boolean, false)
  );
  return new;
end;
$function$;
