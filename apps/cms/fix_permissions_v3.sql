-- Use integers for IDs instead of UUIDs
DO $$
DECLARE
    public_role_id INTEGER;
    perm_id INTEGER;
    
    -- Permissions to grant
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
            INSERT INTO up_permissions_role_lnk (role_id, permission_id)
            VALUES (public_role_id, perm_id)
            ON CONFLICT DO NOTHING;
        ELSE
            RAISE NOTICE 'Permission action % not found in up_permissions', p;
        END IF;
    END LOOP;
END $$;
