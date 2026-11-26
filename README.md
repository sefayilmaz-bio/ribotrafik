# RiboTrafik

**mRNA Ribozom Trafiği, Dizom Çarpışması (RQC) ve Eş-Çevrimsel Katlanma Stüdyosu**  
*(Interactive Inhomogeneous TASEP Ribosome Traffic, Disome Collision & Co-Translational Folding Simulator)*

> **Canlı Demo / Live App:** [https://sefayilmaz-bio.github.io/ribotrafik/](https://sefayilmaz-bio.github.io/ribotrafik/)  
> **Kaynak Kod / Repository:** [https://github.com/sefayilmaz-bio/ribotrafik](https://github.com/sefayilmaz-bio/ribotrafik)

---

## Bilimsel Konu: Neden RiboTrafik?

Biyoinformatikte çoğu araç protein katlanmasını (AlphaFold gibi statik 3B yapı tahmini) veya klasik **Max-CAI** kodon optimizasyonunu ayrı ayrı ele alır. Oysa hücre içinde bir mRNA molekülü, üzerinde fiziksel **10 kodonluk (L = 10)** ayak izine sahip ribozomların ilerlediği tek yönlü bir otoyoldur.

Klasik **Max-CAI** yaklaşımı iki kritik biyofiziksel hataya yol açar:
1. **Eş-Çevrimsel Katlanma Penceresini Siler:** Bir protein domaini sentezlendikten ~30 amino asit sonra (ribozom çıkış tüneli uzunluğu) geçici bir yavaşlama penceresine ihtiyaç duyar ki domain doğru katlanabilsin. Tüm kodonları hızlandırmak yanlış katlanmaya yol açar.
2. **Dizom Çarpışması ve RQC Yıkımı Tetikler:** 5' bölgesini aşırı hızlandırmak, ribozomları kaçınılmaz amino asit kaynaklı frenlerin (poli-prolin `PP/PPP` motifleri veya çıkış tünelinde `+K/R` elektrostatik sürtünmesi) arkasına yığar. Çarpışan ribozomlar (**dizomlar**), hücrede **RQC (Ribosome-associated Quality Control / ZNF598–Hel2)** sistemini tetikleyerek proteinin parçalanmasına neden olur.

**RiboTrafik**, homojen olmayan **TASEP** (Totally Asymmetric Simple Exclusion Process) fizik motorunu kullanarak:
- Protein dizisini **%100 özdeş** tutarak eşanlamlı kodonları optimize eder,
- Dizom çarpışmalarını ve RQC riskini minimize eder,
- Domain sınırlarından **+30 aa** sonrasındaki katlanma duraklama pencerelerini bilerek korur.

---

## Özellikler / Features

- **Inhomogeneous TASEP Motoru (`L = 10` kodon):** Başlatma hızı ($\alpha$), durdurma hızı ($\beta$) ve her kodonun çarpımsal biyofiziksel hızı ($k_{\text{eff}} = k_{\text{base}} \times f_{\text{charge}} \times f_{\text{polypro}} \times f_{\text{hairpin}}$).
- **Canlı Ribozom Otoyolu (HTML5 Canvas):** 60S/40S alt birimleri, uzayan polipeptid zinciri, tünel çıkışında katlanan domain globülleri ve dizom çarpışma şok dalgaları.
- **Senkronize Sentetik Ribo-Seq & Çarpışma Grafiği:** Kodon bazlı ribozom yoğunluğu, dizom çarpışma oranları, hız profili ve domain katlanma arkları.
- **Akıllı Optimizasyon & Kodon Heykeltıraşı:** Tek tıkla `RiboTrafik Optimize` vs klasik `Max-CAI` karşılaştırması ve tekil kodon düzeyinde eşanlamlı düzenleme.
- **Özel FASTA / Domain Desteği & Dışa Aktarım:** `.fasta`, `.csv` (Ribo-Seq tablosu) ve `.json` biyofizik raporu indirme.
- **Tam Çift Dilli Arayüz:** Türkçe (`TR`) ve İngilizce (`EN`).

---

## Yerel Çalıştırma / Local Run

Saf HTML5 + CSS3 + ES6 Modülleri ile sıfır bağımlılıklıdır (build gerekmez):

```bash
python -m http.server 8765
```

Ardından tarayıcıda `http://localhost:8765` adresini açın.
