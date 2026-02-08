# Dose-Drift Detector

**Judul:** *Dose-Drift Detector: Deteksi Pergeseran Dosis Harian Berbasis AI pada CBCT untuk Trigger Adaptive Replanning*  
**Author:** **dr. Muhammad Sobri Maulana**

## Latar Belakang
Dose-Drift Detector adalah prototipe aplikasi berbasis **React + Python (FastAPI)** untuk memantau perubahan anatomi harian pasien radioterapi fraksinasi panjang (misalnya **Head & Neck** atau **cervix**) dari data CBCT. Sistem AI sederhana ini memberikan estimasi awal risiko **penurunan D95 target** dan **overdosis OAR**, sehingga tim klinis dapat melakukan trigger adaptive replanning lebih cepat.

## Kerangka Studi (PICO)
- **P (Population):** Pasien RT fraksinasi panjang (H&N / cervix)
- **I (Intervention):** AI memonitor perubahan anatomi harian + estimasi dose drift
- **C (Comparison):** Evaluasi manual periodik (mingguan/berkala)
- **O (Outcomes):**
  - Penurunan D95 target
  - Overdosis OAR
  - Waktu ke replanning
  - Angka toxicitas akut

**Desain:** Prospektif pragmatik.

## Arsitektur Sederhana
- `backend/`: FastAPI API untuk analisis dose drift
- `frontend/`: React app untuk memicu analisis dan menampilkan hasil

## Menjalankan Backend (Python)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Endpoint utama:
- `GET /health`
- `POST /analyze`

## Menjalankan Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

Aplikasi frontend berjalan di `http://127.0.0.1:5173` dan memanggil backend di `http://127.0.0.1:8000/analyze`.

## Contoh Payload `POST /analyze`
```json
{
  "patient_id": "RT-HN-001",
  "fraction_site": "H&N",
  "daily_metrics": [
    {
      "day": 1,
      "target_volume_change_pct": 1.5,
      "setup_error_mm": 1.8,
      "weight_loss_pct": 0.2
    }
  ]
}
```

## Catatan
Model AI yang digunakan saat ini adalah **heuristik baseline** untuk prototyping dan belum ditujukan sebagai alat keputusan klinis final. Validasi klinis dan dosimetrik lanjutan tetap diperlukan.
