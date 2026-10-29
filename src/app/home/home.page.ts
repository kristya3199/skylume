
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DataCuaca {
  waktu: string;
  suhu: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  dataCuaca: DataCuaca[] = [];
  loading = false;
  errorMessage = '';

  constructor(private cdr: ChangeDetectorRef) {}

  async ambilCuaca(): Promise<void> {
    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.dataCuaca = [];
    this.cdr.detectChanges();

    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&hourly=temperature_2m&forecast_days=1&timezone=Asia%2FJakarta';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Server cuaca error (${response.status}).`);
      }

      const hasil = await response.json();
      const waktu = hasil?.hourly?.time;
      const suhu = hasil?.hourly?.temperature_2m;

      if (!Array.isArray(waktu) || !Array.isArray(suhu) || !waktu.length) {
        throw new Error('Data cuaca tidak tersedia.');
      }

      this.dataCuaca = waktu.slice(0, 10).map(
        (jam: string, index: number) => ({
          waktu: new Date(jam).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta'
          }),
          suhu: suhu[index]
        })
      );
    } catch (error: unknown) {
      this.errorMessage =
        error instanceof Error && error.name === 'AbortError'
          ? 'Koneksi terlalu lama. Periksa internet lalu coba lagi.'
          : error instanceof Error
            ? error.message
            : 'Gagal mengambil data cuaca.';
    } finally {
      clearTimeout(timer);
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
