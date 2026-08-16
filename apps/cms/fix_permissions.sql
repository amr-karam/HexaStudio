-- 1. Find the Public Role ID
-- 2. Find/Create the Permission IDs for Articles and Pages
-- 3. Insert into up_permissions

DO $$
DECLARE
    public_role_id UUID;
    perm_id UUID;
    
    -- Permissions to grant
    perms TEXT[] := ARRAY[
        'api::article.article.find', 
        'api::article.article.findOne', 
        'api::page.page.find', 
        'api::page.page.findOne'
    ];
    p TEXT;
BEGIN
    -- Get Public Role ID
    SELECT id INTO public_role_id FROM up_role WHERE name = 'Public';
    
    IF public_role_id IS NULL THEN
        RAISE EXCEPTION 'Public role not found';
    END IF;

    FOREACH p IN ARRAY perms LOOP
        -- Find the permission ID in up_permission
        -- Note: Strapi usually stores the action name in a column like 'action'
        -- and the content type in 'plugin' or similar. 
        -- In Strapi 5, it's often a single string in 'action'.
        
        SELECT id INTO perm_id FROM up_permission WHERE action = p;
        
        IF perm_id IS NOT NULL THEN
            -- Insert if not already present
            INSERT INTO up_permissions (role_id, permission_id)
            VALUES (public_role_id, perm_id)
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;
