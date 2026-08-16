-- 1. Find the Public Role ID
-- 2. Find the Permission IDs for Articles and Pages
-- 3. Insert into up_permissions_role_lnk

DO $$
DECLARE
    public_role_id UUID;
    perm_id UUID;
    
    -- Permissions to grant
    -- In Strapi 5, the action name is stored in the 'action' column of 'up_permissions'
    perms TEXT[] := ARRAY[
        'api::article.article.find', 
        'api::article.article.findOne', 
        'api::page.page.find', 
        'api::page.page.findOne'
    ];
    p TEXT;
BEGIN
    -- Get Public Role ID from up_roles
    SELECT id INTO public_role_id FROM up_roles WHERE name = 'Public';
    
    IF public_role_id IS NULL THEN
        RAISE EXCEPTION 'Public role not found in up_roles';
    END IF;

    FOREACH p IN ARRAY perms LOOP
        -- Find the permission ID in up_permissions
        SELECT id INTO perm_id FROM up_permissions WHERE action = p;
        
        IF perm_id IS NOT NULL THEN
            -- Insert into the link table
            -- Column names in up_permissions_role_lnk are typically role_id and permission_id
            INSERT INTO up_permissions_role_lnk (role_id, permission_id)
            VALUES (public_role_id, perm_id)
            ON CONFLICT DO NOTHING;
        ELSE
            RAISE NOTICE 'Permission action % not found in up_permissions', p;
        END IF;
    END LOOP;
END $$;
