# WhatsApp Gözetmen Botu

Hedef grup: **BK Çarşı Şube Gözetmenlik**

Bot pazar günü belirlenen saat aralığında hedef gruptaki gözetmenlik duyurusunu dinler.
Duyurudaki ilk iki seans saatini çıkarıp tek sefer:

`Furkan Esad Uzun - 10.15 ve 17.20 seansları`

formatında cevap verir.

## İlk güvenlik ayarı
`DRY_RUN=true` varsayılandır. Bu modda duyuru algılanır ama gerçek mesaj gönderilmez.
Testten sonra `DRY_RUN=false` yapılır.

## Kurulum
1. `.env.example` dosyasını `.env` olarak kopyala.
2. `npm install`
3. `npm start`
4. Terminalde çıkan QR kodunu WhatsApp > Bağlı cihazlar > Cihaz bağla ile okut.

## Hosting
`.wwebjs_auth` ve `data` klasörleri kalıcı depolamada tutulmalıdır.
Serverless/ephemeral dosya sistemleri bu bot için uygun değildir.

Not: Bu proje resmi WhatsApp Business API yerine WhatsApp Web otomasyonu kullanır; hesap kısıtlaması riski sıfır değildir.
