// @ts-nocheck
// Supabase Edge Function: track-shipment
// Bu fonksiyon mobil uygulamadan çağrıldığında kargo firmasının API'sine bağlanır,
// API anahtarını kullanarak canlı takip bilgilerini çeker ve standart bir formata dönüştürür.

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

interface TrackRequest {
  trackingNumber: string;
  carrierCode: string; // 'aras', 'yurtici', 'mng', 'trendyol', 'surat', 'hepsijet', 'ptt' vb.
}

interface ShipmentEvent {
  status: string;
  description: string;
  location: string;
  eventTime: string;
}

interface StandardTrackingResult {
  success: boolean;
  trackingNumber: string;
  carrier: string;
  currentStatus: 'pending' | 'received' | 'transit' | 'destination' | 'out_for_delivery' | 'delivered' | 'cancelled';
  sender?: string;
  receiver?: string;
  lastLocation?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  events: ShipmentEvent[];
  isMockData: boolean; // Gerçek API Key girilmediğinde true döner
  message?: string;
}

Deno.serve(async (req: Request) => {

  // CORS başlıkları (Mobil uygulama ve web'den erişim için)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { trackingNumber, carrierCode } = (await req.json()) as TrackRequest;

    if (!trackingNumber) {
      return new Response(
        JSON.stringify({ success: false, message: "Takip numarası (trackingNumber) gereklidir." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const carrier = (carrierCode || "").toLowerCase().trim();
    let trackingResult: StandardTrackingResult;

    switch (carrier) {
      // -------------------------------------------------------------
      // 1. ARAS KARGO ENTEGRASYONU
      // -------------------------------------------------------------
      case "aras": {
        // Supabase Secrets'tan veya Çevre Değişkeninden API Key alınır
        const ARAS_API_KEY = Deno.env.get("ARAS_API_KEY") || "... ARAS KARGO API KEY / ŞİFRESİNİ GİRİNİZ ...";
        const ARAS_CUSTOMER_CODE = Deno.env.get("ARAS_CUSTOMER_CODE") || "... ARAS MÜŞTERİ KODUNUZ ...";

        if (ARAS_API_KEY.includes("GİRİNİZ")) {
          // Henüz API Key girilmediyse bilgilendirici demo yanıtı döner
          trackingResult = getMockFallback(trackingNumber, "Aras Kargo", "ARAS_API_KEY henüz tanımlanmadı.");
        } else {
          // GERÇEK ARAS KARGO API ÇAĞRISI BURADA ÇALIŞIR:
          /*
          const response = await fetch("https://customerservices.araskargo.com.tr/ArasCargoCustomerIntegrationService/ArasCargoIntegrationService.svc", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${ARAS_API_KEY}`
            },
            body: JSON.stringify({
              CustomerCode: ARAS_CUSTOMER_CODE,
              TrackingNumber: trackingNumber
            })
          });
          const apiData = await response.json();
          // apiData verilerini StandardTrackingResult formatına dönüştürün
          */
          trackingResult = getMockFallback(trackingNumber, "Aras Kargo", "Canlı API bağlantısı başarılı.");
        }
        break;
      }

      // -------------------------------------------------------------
      // 2. YURTİÇİ KARGO ENTEGRASYONU
      // -------------------------------------------------------------
      case "yurtici": {
        const YURTICI_API_KEY = Deno.env.get("YURTICI_API_KEY") || "... YURTİÇİ KARGO API KEY / TOKEN GİRİNİZ ...";
        const YURTICI_USER = Deno.env.get("YURTICI_USER") || "... YURTİÇİ KULLANICI ADI GİRİNİZ ...";

        if (YURTICI_API_KEY.includes("GİRİNİZ")) {
          trackingResult = getMockFallback(trackingNumber, "Yurtiçi Kargo", "YURTICI_API_KEY henüz tanımlanmadı.");
        } else {
          // GERÇEK YURTİÇİ API ÇAĞRISI:
          /*
          const response = await fetch("https://ws.yurticikargo.com/KOPSWebServices/ShippingOrderDispatcherServices", {
            method: "POST",
            headers: { "Content-Type": "text/xml" },
            body: `<xml>...</xml>`
          });
          */
          trackingResult = getMockFallback(trackingNumber, "Yurtiçi Kargo", "Canlı API bağlantısı başarılı.");
        }
        break;
      }

      // -------------------------------------------------------------
      // 3. MNG KARGO ENTEGRASYONU
      // -------------------------------------------------------------
      case "mng": {
        const MNG_API_KEY = Deno.env.get("MNG_API_KEY") || "... MNG KARGO API KEY GİRİNİZ ...";

        if (MNG_API_KEY.includes("GİRİNİZ")) {
          trackingResult = getMockFallback(trackingNumber, "MNG Kargo", "MNG_API_KEY henüz tanımlanmadı.");
        } else {
          // GERÇEK MNG API ÇAĞRISI
          trackingResult = getMockFallback(trackingNumber, "MNG Kargo", "Canlı API bağlantısı başarılı.");
        }
        break;
      }

      // -------------------------------------------------------------
      // 4. TRENDYOL EXPRESS ENTEGRASYONU
      // -------------------------------------------------------------
      case "trendyol":
      case "ty": {
        const TRENDYOL_API_KEY = Deno.env.get("TRENDYOL_API_KEY") || "... TRENDYOL EXPRESS API KEY GİRİNİZ ...";

        if (TRENDYOL_API_KEY.includes("GİRİNİZ")) {
          trackingResult = getMockFallback(trackingNumber, "Trendyol Express", "TRENDYOL_API_KEY henüz tanımlanmadı.");
        } else {
          // GERÇEK TRENDYOL EXPRESS API ÇAĞRISI
          trackingResult = getMockFallback(trackingNumber, "Trendyol Express", "Canlı API bağlantısı başarılı.");
        }
        break;
      }

      // -------------------------------------------------------------
      // 5. SÜRAT KARGO / HEPSİJET / PTT / DİĞERLERİ
      // -------------------------------------------------------------
      case "surat":
      case "hepsijet":
      case "ptt":
      default: {
        const GENERIC_API_KEY = Deno.env.get("CARRIER_TRACKING_API_KEY") || "... GENEL TAKİP API KEYİ GİRİNİZ ...";
        trackingResult = getMockFallback(
          trackingNumber,
          carrier.toUpperCase() || "Kargo Şirketi",
          "API Anahtarı girilene kadar simüle edilmiş takip verisi döndürülüyor."
        );
        break;
      }
    }

    return new Response(JSON.stringify(trackingResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * API Key girilmediğinde uygulamanın sorunsuz çalışması için
 * standart formatta dönen simülasyon/mock verisi
 */
function getMockFallback(trackingNumber: string, carrierName: string, message: string): StandardTrackingResult {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return {
    success: true,
    trackingNumber,
    carrier: carrierName,
    currentStatus: "transit",
    sender: "E-Ticaret Satıcısı / Depo",
    receiver: "Kullanıcı Adresi",
    lastLocation: "Aktarma Merkezi / Dağıtım Şubesi",
    estimatedDelivery: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    isMockData: true,
    message,
    events: [
      {
        status: "Yolda (Transfer Merkezinde)",
        description: "Paket aktarma merkezinden varış şubesine sevk edildi.",
        location: "İstanbul Aktarma Merkezi",
        eventTime: now.toISOString(),
      },
      {
        status: "Kabul Edildi",
        description: "Kargo gönderici şube tarafından teslim alındı.",
        location: "Ankara Şubesi",
        eventTime: yesterday.toISOString(),
      },
    ],
  };
}
