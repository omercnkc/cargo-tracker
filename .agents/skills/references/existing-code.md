# Existing Code First

## Temel İlke

Bu projede yeni dosya veya klasör oluşturmadan önce mevcut yapıyı incele.

## Kod eklerken uygulanacak sıra

1. İlgili feature klasörünü kontrol et.
2. Aynı sorumluluğa sahip dosya var mı kontrol et.
3. Dosya varsa mevcut dosyayı güncelle.
4. Dosya yoksa mimariye uygun yeni dosya oluştur.

## Ekranlar

- Screen mevcutsa yeni Screen oluşturma.
- Mevcut Screen içerisine gerekli UI ve business logic'i ekle.
- Aynı işi yapan ikinci Screen oluşturma.

## Componentler

- Önce ortak componentleri kontrol et.
- Uygun component varsa yeniden kullan.
- Sadece gerçekten yeni bir component gerekiyorsa oluştur.

## Repository

Repository mevcutsa yeni repository oluşturma.

Doğru:

ShipmentRepository.ts
    ↓
yeni metodu buraya ekle

Yanlış:

ShipmentRepositoryV2.ts

## Service

Service dosyası mevcutsa aynı dosyayı genişlet.

Yanlış:

trackingService2.ts

## Hooks

Önce feature içerisindeki hookları kontrol et.

Var olan hook genişletilebiliyorsa yeni hook oluşturma.

## Zustand Store

Store mevcutsa yeni store açma.

Store büyütülebiliyorsa mevcut store'u güncelle.

## TanStack Query

Var olan query key ve hookları kullan.

Aynı endpoint için ikinci query hook yazma.

## Navigation

Route mevcutsa yeniden tanımlama.

Navigation dosyalarını çoğaltma.

## Dosya Oluşturma Kuralları

Yeni dosya yalnızca aşağıdaki durumlarda oluşturulabilir:

- İlgili dosya mevcut değilse
- Sorumluluk gerçekten farklıysa
- Mevcut dosya mimariyi bozacak kadar büyüdüyse
- Kullanıcı özellikle yeni dosya oluşturulmasını istediyse

## Yasaklar

- Aynı işi yapan ikinci component oluşturma.
- Aynı işi yapan ikinci repository oluşturma.
- Aynı işi yapan ikinci service oluşturma.
- Aynı işi yapan ikinci screen oluşturma.
- Aynı işi yapan ikinci hook oluşturma.
- "New", "V2", "Copy", "Temp" gibi dosya isimleri kullanma.

## Çalışma Akışı

Kod üretmeden önce:

1. Mevcut klasör yapısını incele.
2. İlgili dosyaları bul.
3. Önce mevcut dosyaları güncelle.
4. Gerçekten gerekiyorsa yeni dosya oluştur.