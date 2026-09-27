/* ─────────────────────────────────────────────────────────────
   ALTYAZILAR / CAPTIONS — düzenlenebilir.
   Kısa, tek fikir, 8. sınıf dili. start/end saniye cinsinden.
   note: öğretmen için önerilen seslendirme cümlesi.
   ───────────────────────────────────────────────────────────── */
(function (root) {
  const CAPTIONS = [
    { scene: 1, start: 4.4, end: 10.2, tr: 'Aynı biçim, farklı boy', en: 'The same shape, a different size',
      note: 'Bu üçgenle aynı biçimde ama 1,5 kat büyük bir üçgen çizmek istiyoruz. Hangi elemanları bilmek yeter? Varsayalım: açılar eşitse biçim aynı olur.' },
    { scene: 2, start: 10.8, end: 19.2, tr: 'İki açı', en: 'Two angles',
      note: 'Yalnızca B ve C açılarını kullanalım. Işınlar tek bir noktada buluşuyor; üçüncü açı da kendiliğinden eşit, çünkü toplam 180 derece.' },
    { scene: 2, start: 19.4, end: 27.8, tr: 'AA', en: 'Angle-angle',
      note: 'Büyük üçgeni küçültüp asılın üstüne koyalım: örtüşüyor. İki açısı eşit üçgenler benzerdir.' },
    { scene: 3, start: 28.8, end: 36.8, tr: 'Orantılı üç kenar', en: 'Three proportional sides',
      note: 'Üç kenarı da 1,5 katına çıkaralım ve yaylarla çizelim. Küçültünce asılla örtüşüyor: kenarları orantılı üçgenler benzerdir.' },
    { scene: 3, start: 37.0, end: 45.8, tr: 'KAK', en: 'Side-angle-side',
      note: 'İki kenarı 1,5 katı, aralarındaki açı eşit: yine benzer. Her kenarın oranı aynı olmalı.' },
    { scene: 4, start: 46.8, end: 55.0, tr: 'Eklemek büyütmek değil', en: 'Adding is not scaling',
      note: 'Her kenara 1,5 ekleyelim. Oran değil fark aynı; küçültünce örtüşmüyor, açılar değişti.' },
    { scene: 4, start: 55.2, end: 63.8, tr: 'Bir açı yetmez', en: 'One angle is not enough',
      note: 'Yalnızca bir açısı eşit olan üçgenin biçimi belirlenmiyor. Ya açılar eşit ya da kenarlar orantılı olmalı.' },
    { scene: 5, start: 64.8, end: 72.8, tr: 'Gölgeyle yükseklik', en: 'Height from a shadow',
      note: '2 metrelik bir çubuğun gölgesi 3 metre, ağacın gölgesi 12 metre. Güneş ışınları aynı açıyla geldiği için üçgenler benzer: 12 bölü 3, 4 kat.' },
    { scene: 5, start: 73.0, end: 79.8, tr: 'Ağaç 8 m', en: 'The tree is 8 m',
      note: 'Ağaç 2 çarpı 4, 8 metre. Ölçemediğimiz bir yüksekliği benzerlikle bulduk.' },
    { scene: 6, start: 80.6, end: 86.4, tr: 'AA, KKK, KAK', en: 'AA, SSS, SAS',
      note: 'Aklında kalsın: iki açı eşitse ya da kenarlar orantılıysa üçgenler benzerdir.' },
    { scene: 6, start: 86.8, end: 91.0, tr: 'Aynı biçim, farklı boyut!', en: 'Same shape, different size!',
      note: 'Benzerlik: aynı biçim, farklı boyut!' },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CAPTIONS;
  else { root.LI = root.LI || {}; root.LI.CAPTIONS = CAPTIONS; }
})(typeof window !== 'undefined' ? window : globalThis);
