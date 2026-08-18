-- ========================================================
-- CANLI SUPABASE VERİTABANINA MOCK KARGOLAR EKLEME SCRIPTI
-- ========================================================
-- Bu scripti Supabase Dashboard -> SQL Editor'e yapıştırıp "Run" diyerek çalıştırabilirsiniz.
-- Oturum açmış olan kullanıcınızın hesabına 6 farklı duruma sahip gerçekçi kargolar ekler.

do $$
declare
    v_user_id uuid;
    v_trendyol_id uuid;
    v_hepsijet_id uuid;
    v_yurtici_id uuid;
    v_aras_id uuid;
    v_surat_id uuid;
    v_kargoist_id uuid;
    v_dhl_id uuid;
    
    v_shipment_1 uuid := gen_random_uuid();
    v_shipment_2 uuid := gen_random_uuid();
    v_shipment_3 uuid := gen_random_uuid();
    v_shipment_4 uuid := gen_random_uuid();
    v_shipment_5 uuid := gen_random_uuid();
    v_shipment_6 uuid := gen_random_uuid();
begin
    -- 1. Mevcut aktif kullanıcıyı bul
    select id into v_user_id from auth.users order by created_at desc limit 1;
    
    if v_user_id is null then
        raise notice 'Henüz auth.users tablosunda kullanıcı bulunamadı.';
        return;
    end if;

    -- 2. Kargo firmalarını getir veya oluştur
    select id into v_trendyol_id from public.courier_companies where code = 'trendyol' limit 1;
    select id into v_hepsijet_id from public.courier_companies where code = 'hepsijet' limit 1;
    select id into v_yurtici_id from public.courier_companies where code = 'yurtici' limit 1;
    select id into v_aras_id from public.courier_companies where code = 'aras' limit 1;
    select id into v_surat_id from public.courier_companies where code = 'surat' limit 1;
    select id into v_kargoist_id from public.courier_companies where code = 'kargoist' limit 1;
    select id into v_dhl_id from public.courier_companies where code = 'dhl' limit 1;

    -- 3. Önceki kargoları temizle (İsteğe bağlı temiz başlangıç)
    delete from public.shipments where user_id = v_user_id;

    -- ========================================================
    -- FARKLI DURUMLARDA 6 ADET YENİ MOCK KARGO
    -- ========================================================

    -- KARGO 1: DAĞITIMA ÇIKARILDI (out_for_delivery)
    insert into public.shipments (
        id, user_id, company_id, title, tracking_number, current_status, sender, receiver, last_location, estimated_delivery, is_archived, created_at
    ) values (
        v_shipment_1, v_user_id, v_trendyol_id, 'Kablosuz Kulaklık & Koruma Kılıfı', 'TY7382910482', 'out_for_delivery', 'Trendyol Tech Mağazası', 'Ömer Çanakçı - İstanbul', 'Beşiktaş Dağıtım Merkezi', current_date, false, now() - interval '1 day'
    );

    insert into public.shipment_events (shipment_id, status, description, location, event_time) values
    (v_shipment_1, 'Kurye Dağıtımda', 'Kurye teslimat adresinize doğru yola çıktı.', 'Beşiktaş Dağıtım Merkezi', now() - interval '2 hours'),
    (v_shipment_1, 'Varış Şubesinde', 'Paket dağıtım şubesine ulaştı ve kuryeye zimmetlendi.', 'Beşiktaş Şubesi', now() - interval '5 hours'),
    (v_shipment_1, 'Transfer Merkezinde', 'Ana aktarma merkezinden varış şubesine sevk edildi.', 'İstanbul Aktarma', now() - interval '12 hours'),
    (v_shipment_1, 'Kabul Edildi', 'Gönderici kargoyu teslim etti.', 'İzmir Şube', now() - interval '1 day');


    -- KARGO 2: YOLDA / TRANSFER MERKEZİNDE (transit)
    insert into public.shipments (
        id, user_id, company_id, title, tracking_number, current_status, sender, receiver, last_location, estimated_delivery, is_archived, created_at
    ) values (
        v_shipment_2, v_user_id, v_hepsijet_id, 'Mekanik Oyuncu Klavyesi', 'HJ9482019384', 'transit', 'Hepsiburada Satıcısı', 'Ömer Çanakçı - İstanbul', 'Bolu - Düzce Otoyol Hattı', current_date + interval '1 day', false, now() - interval '2 days'
    );

    insert into public.shipment_events (shipment_id, status, description, location, event_time) values
    (v_shipment_2, 'Yolda', 'Transfer aracı varış merkezine hareket etti.', 'Bolu Aktarma', now() - interval '6 hours'),
    (v_shipment_2, 'Transfer Merkezinde', 'Paket ayrıştırma bandından geçirildi.', 'Ankara Lojistik Merkezi', now() - interval '18 hours'),
    (v_shipment_2, 'Çıkış Şubesinde', 'Paket kurye tarafından teslim alındı.', 'Ankara Çankaya', now() - interval '2 days');


    -- KARGO 3: VARIŞ ŞUBESİNDE (destination)
    insert into public.shipments (
        id, user_id, company_id, title, tracking_number, current_status, sender, receiver, last_location, estimated_delivery, is_archived, created_at
    ) values (
        v_shipment_3, v_user_id, v_yurtici_id, 'Deri Sırt Çantası', 'YK8473920194', 'destination', 'Moda Deri Tasarım A.Ş.', 'Ömer Çanakçı - İzmir', 'Bornova Şubesi', current_date, false, now() - interval '3 days'
    );

    insert into public.shipment_events (shipment_id, status, description, location, event_time) values
    (v_shipment_3, 'Varış Şubesinde', 'Paket varış şubesinde teslimat sırasına alındı.', 'Bornova Şubesi', now() - interval '3 hours'),
    (v_shipment_3, 'Transfer Merkezinde', 'Marmara Aktarma Merkezinden şubeye ulaştı.', 'İzmir Aktarma', now() - interval '14 hours'),
    (v_shipment_3, 'Gönderici Şubede', 'Kargo kabulü yapıldı.', 'Bursa Heykel Şubesi', now() - interval '3 days');


    -- KARGO 4: TESLİM EDİLDİ (delivered)
    insert into public.shipments (
        id, user_id, company_id, title, tracking_number, current_status, sender, receiver, last_location, estimated_delivery, delivered_at, is_archived, created_at
    ) values (
        v_shipment_4, v_user_id, v_aras_id, 'Koşu Ayakkabısı (42 Numara)', 'AR2948103947', 'delivered', 'SporStore Online', 'Ömer Çanakçı - Ankara', 'Teslim Edildi', current_date - interval '1 day', now() - interval '1 day', false, now() - interval '4 days'
    );

    insert into public.shipment_events (shipment_id, status, description, location, event_time) values
    (v_shipment_4, 'Teslim Edildi', 'Alıcıya bizzat teslim edildi.', 'Ankara Çankaya', now() - interval '1 day'),
    (v_shipment_4, 'Dağıtıma Çıkarıldı', 'Kurye teslimat için adrese yöneldi.', 'Ankara Şubesi', now() - interval '1 day 4 hours'),
    (v_shipment_4, 'Kargo Kabul', 'Kargo şubeye teslim edildi.', 'İstanbul Kadıköy', now() - interval '4 days');


    -- KARGO 5: SİPARİŞ ALINDI / HAZIRLANIYOR (created)
    insert into public.shipments (
        id, user_id, company_id, title, tracking_number, current_status, sender, receiver, last_location, estimated_delivery, is_archived, created_at
    ) values (
        v_shipment_5, v_user_id, v_surat_id, 'Yazılım & Tasarım Kitapları', 'SK1928374650', 'created', 'Akademi Kitabevi', 'Ömer Çanakçı - İzmir', 'Gönderici Hazırlık Aşamasında', current_date + interval '3 days', false, now() - interval '4 hours'
    );

    insert into public.shipment_events (shipment_id, status, description, location, event_time) values
    (v_shipment_5, 'Sipariş Oluşturuldu', 'Kargo barkodu oluşturuldu, kurye alımı bekleniyor.', 'Ankara Kızılay', now() - interval '4 hours');


    -- KARGO 6: KABUL EDİLDİ / ŞUBEDE (received)
    insert into public.shipments (
        id, user_id, company_id, title, tracking_number, current_status, sender, receiver, last_location, estimated_delivery, is_archived, created_at
    ) values (
        v_shipment_6, v_user_id, v_kargoist_id, 'Filtre Kahve Çekirdeği 1KG', 'KG8392019381', 'received', 'Roastery Coffee Co.', 'Ömer Çanakçı - Antalya', 'İstanbul Levent Şubesi', current_date + interval '2 days', false, now() - interval '1 day'
    );

    insert into public.shipment_events (shipment_id, status, description, location, event_time) values
    (v_shipment_6, 'Şubede Kabul Edildi', 'Gönderi şube tarafından teslim alındı.', 'İstanbul Levent Şubesi', now() - interval '18 hours'),
    (v_shipment_6, 'Sipariş Onaylandı', 'Satıcı kargo kaydını açtı.', 'İstanbul', now() - interval '1 day');

    raise notice '6 adet farklı duruma sahip kargo başarıyla eklendi!';
end $$;
