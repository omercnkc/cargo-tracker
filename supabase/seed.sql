-- ========================================================
-- CARGO TRACKER SEED DATA
-- ========================================================

-- 1. MOCK AUTH USERS & PUBLIC USERS
insert into auth.users (
    id, 
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'omer@example.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz012345',
        now(),
        '{"full_name": "Ömer Çanakçı", "avatar_url": "https://i.pravatar.cc/300?img=11"}'::jsonb,
        now(),
        now()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'ahmet@example.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz012345',
        now(),
        '{"full_name": "Ahmet Yılmaz", "avatar_url": "https://i.pravatar.cc/300?img=12"}'::jsonb,
        now(),
        now()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'ayse@example.com',
        '$2a$10$abcdefghijklmnopqrstuvwxyz012345',
        now(),
        '{"full_name": "Ayşe Demir", "avatar_url": "https://i.pravatar.cc/300?img=13"}'::jsonb,
        now(),
        now()
    )
on conflict (id) do nothing;

insert into public.users (id, full_name, avatar_url, phone)
values
    ('11111111-1111-1111-1111-111111111111', 'Ömer Çanakçı', 'https://i.pravatar.cc/300?img=11', '+905551112233'),
    ('22222222-2222-2222-2222-222222222222', 'Ahmet Yılmaz', 'https://i.pravatar.cc/300?img=12', '+905321112233'),
    ('33333333-3333-3333-3333-333333333333', 'Ayşe Demir', 'https://i.pravatar.cc/300?img=13', '+905421112233')
on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    phone = excluded.phone;

-- 2. COURIER COMPANIES
insert into public.courier_companies (name, code, logo_url, website, tracking_url, active)
values 
    ('Aras Kargo', 'aras', 'https://example.com/logos/aras.png', 'https://www.araskargo.com.tr', 'https://www.araskargo.com.tr/takip', true),
    ('Yurtiçi Kargo', 'yurtici', 'https://example.com/logos/yurtici.png', 'https://www.yurticikargo.com', 'https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula', true),
    ('MNG Kargo', 'mng', 'https://example.com/logos/mng.png', 'https://www.mngkargo.com.tr', 'https://www.mngkargo.com.tr/gonderitakip', true),
    ('PTT Kargo', 'ptt', 'https://example.com/logos/ptt.png', 'https://www.ptt.gov.tr', 'https://gonderitakip.ptt.gov.tr', true),
    ('Sürat Kargo', 'surat', 'https://example.com/logos/surat.png', 'https://www.suratkargo.com.tr', 'https://www.suratkargo.com.tr/KargoTakip', true),
    ('UPS Türkiye', 'ups', 'https://example.com/logos/ups.png', 'https://www.ups.com/tr', 'https://www.ups.com/track', true),
    ('DHL Express', 'dhl', 'https://example.com/logos/dhl.png', 'https://www.dhl.com/tr-tr', 'https://www.dhl.com/tr-tr/home/tracking.html', true),
    ('HepsiJET', 'hepsijet', 'https://example.com/logos/hepsijet.png', 'https://www.hepsijet.com', 'https://www.hepsijet.com/kargo-takibi', true),
    ('Kolay Gelsin', 'kolaygelsin', 'https://example.com/logos/kolaygelsin.png', 'https://www.kolaygelsin.com', 'https://www.kolaygelsin.com/gonderi-takibi', true),
    ('Trendyol Express', 'trendyolexpress', 'https://example.com/logos/trendyol.png', 'https://www.trendyol.com', 'https://www.trendyol.com', true),
    ('Kargoist', 'kargoist', 'https://example.com/logos/kargoist.png', 'https://www.kargoist.com', 'https://www.kargoist.com/kargo-takip', true),
    ('Scotty', 'scotty', 'https://example.com/logos/scotty.png', 'https://scotty.com.tr', 'https://scotty.com.tr/kargo-takip', true),
    ('Horoz Lojistik', 'horoz', 'https://example.com/logos/horoz.png', 'https://www.horoz.com.tr', 'https://www.horoz.com.tr/kargo-takip', true),
    ('Ceva Logistics', 'ceva', 'https://example.com/logos/ceva.png', 'https://www.cevalogistics.com', 'https://www.cevalogistics.com/tracking', true),
    ('FedEx', 'fedex', 'https://example.com/logos/fedex.png', 'https://www.fedex.com/tr-tr/home.html', 'https://www.fedex.com/fedextrack/', true)
on conflict (code) do update set
    name = excluded.name,
    logo_url = excluded.logo_url,
    website = excluded.website,
    tracking_url = excluded.tracking_url,
    active = excluded.active;

-- 3. SHIPMENTS
insert into public.shipments (
    id, user_id, company_id, title, sender, receiver, tracking_number, current_status, last_location, estimated_delivery, is_archived
)
values
    (
        'a1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        (select id from public.courier_companies where code = 'aras'),
        'Laptop', 'Teknosa', 'Ömer Çanakçı', 'ARS458963214TR', 'Dağıtıma Çıktı', 'Elazığ', '2026-07-29', false
    ),
    (
        'a2222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        (select id from public.courier_companies where code = 'mng'),
        'Telefon Kılıfı', 'Trendyol', 'Ömer Çanakçı', 'MNG784512369TR', 'Transfer Merkezinde', 'Ankara', '2026-07-30', false
    ),
    (
        'a3333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        (select id from public.courier_companies where code = 'yurtici'),
        'Kulaklık', 'Amazon Türkiye', 'Ömer Çanakçı', 'YRT985412365TR', 'Şubeye Ulaştı', 'Elazığ', '2026-07-29', false
    ),
    (
        'a4444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        (select id from public.courier_companies where code = 'ptt'),
        'Kitap', 'D&R', 'Ahmet Yılmaz', 'PTT369852147TR', 'Teslim Edildi', 'Malatya', '2026-07-25', true
    ),
    (
        'a5555555-5555-5555-5555-555555555555',
        '33333333-3333-3333-3333-333333333333',
        (select id from public.courier_companies where code = 'surat'),
        'Ayakkabı', 'FLO', 'Ayşe Demir', 'SUR258963147TR', 'Kargoya Verildi', 'İstanbul', '2026-07-31', false
    ),
    (
        'a6666666-6666-6666-6666-666666666666',
        '11111111-1111-1111-1111-111111111111',
        (select id from public.courier_companies where code = 'ups'),
        'Mouse', 'Vatan Bilgisayar', 'Ömer Çanakçı', 'UPS963258741TR', 'Hazırlanıyor', 'İstanbul', '2026-08-01', false
    ),
    (
        'a7777777-7777-7777-7777-777777777777',
        '22222222-2222-2222-2222-222222222222',
        (select id from public.courier_companies where code = 'dhl'),
        'Monitör', 'İncehesap', 'Ahmet Yılmaz', 'DHL789654123TR', 'Transferde', 'Ankara', '2026-07-30', false
    ),
    (
        'a8888888-8888-8888-8888-888888888888',
        '33333333-3333-3333-3333-333333333333',
        (select id from public.courier_companies where code = 'hepsijet'),
        'Klavye', 'Hepsiburada', 'Ayşe Demir', 'HJT456987123TR', 'Teslim Edildi', 'İzmir', '2026-07-26', true
    )
on conflict (id) do update set
    current_status = excluded.current_status,
    last_location = excluded.last_location,
    estimated_delivery = excluded.estimated_delivery,
    is_archived = excluded.is_archived;

-- 4. SHIPMENT EVENTS
insert into public.shipment_events (shipment_id, status, description, location, event_time)
values
    -- Laptop Events
    ('a1111111-1111-1111-1111-111111111111', 'Kargo Alındı', 'Gönderi kabul edildi', 'İstanbul', now() - interval '3 days'),
    ('a1111111-1111-1111-1111-111111111111', 'Transfer Merkezinde', 'Ana aktarma merkezinde', 'Ankara', now() - interval '2 days'),
    ('a1111111-1111-1111-1111-111111111111', 'Şubeye Ulaştı', 'Elazığ şubesine ulaştı', 'Elazığ', now() - interval '1 day'),
    ('a1111111-1111-1111-1111-111111111111', 'Dağıtıma Çıktı', 'Kurye teslimata çıktı', 'Elazığ', now() - interval '2 hours'),

    -- Telefon Kılıfı Events
    ('a2222222-2222-2222-2222-222222222222', 'Kargoya Verildi', 'Satıcı gönderiyi teslim etti', 'İstanbul', now() - interval '2 days'),
    ('a2222222-2222-2222-2222-222222222222', 'Transfer Merkezinde', 'Ankara transfer merkezi', 'Ankara', now() - interval '1 day'),

    -- Kulaklık Events
    ('a3333333-3333-3333-3333-333333333333', 'Kargoya Verildi', 'Satıcı gönderdi', 'İstanbul', now() - interval '4 days'),
    ('a3333333-3333-3333-3333-333333333333', 'Transfer Merkezinde', 'Malatya aktarma', 'Malatya', now() - interval '2 days'),
    ('a3333333-3333-3333-3333-333333333333', 'Şubeye Ulaştı', 'Elazığ şubesi', 'Elazığ', now() - interval '5 hours'),

    -- Kitap Events
    ('a4444444-4444-4444-4444-444444444444', 'Kargoya Verildi', 'Gönderi oluşturuldu', 'Ankara', now() - interval '5 days'),
    ('a4444444-4444-4444-4444-444444444444', 'Dağıtıma Çıktı', 'Kurye dağıtıma çıktı', 'Malatya', now() - interval '3 days'),
    ('a4444444-4444-4444-4444-444444444444', 'Teslim Edildi', 'Teslim tamamlandı', 'Malatya', now() - interval '3 days');

-- 5. NOTIFICATIONS
insert into public.notifications (user_id, shipment_id, title, body, is_read)
values
    ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Kargonuz Dağıtıma Çıktı', 'Laptop siparişiniz bugün teslim edilecek.', false),
    ('11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'Yeni Hareket', 'Telefon Kılıfı Ankara transfer merkezine ulaştı.', true),
    ('22222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'Teslim Edildi', 'Kitap siparişiniz teslim edildi.', true),
    ('11111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'Yeni Hareket', 'Kulaklık Elazığ şubesine ulaştı.', false),
    ('11111111-1111-1111-1111-111111111111', 'a6666666-6666-6666-6666-666666666666', 'Teslim Tarihi Güncellendi', 'Mouse siparişiniz 1 Ağustos''ta teslim edilecek.', false);

-- 6. FAVORITES
insert into public.favorites (user_id, shipment_id)
values
    ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'), -- Ömer - Laptop
    ('11111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333'), -- Ömer - Kulaklık
    ('22222222-2222-2222-2222-222222222222', 'a7777777-7777-7777-7777-777777777777'), -- Ahmet - Monitör
    ('33333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555')  -- Ayşe - Ayakkabı
on conflict (user_id, shipment_id) do nothing;

-- 7. USER SETTINGS
insert into public.user_settings (user_id, language, theme, notifications_enabled, biometric_enabled)
values
    ('11111111-1111-1111-1111-111111111111', 'tr', 'system', true, true),
    ('22222222-2222-2222-2222-222222222222', 'tr', 'dark', true, false),
    ('33333333-3333-3333-3333-333333333333', 'en', 'light', false, false)
on conflict (user_id) do update set
    language = excluded.language,
    theme = excluded.theme,
    notifications_enabled = excluded.notifications_enabled,
    biometric_enabled = excluded.biometric_enabled;
