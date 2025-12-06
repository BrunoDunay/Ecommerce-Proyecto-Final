import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products/products.service';
import { Product } from '../../core/types/Products';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {

  products: Product[] = [];
  loading = true;

  @ViewChild('mobileTrack') mobileTrack!: ElementRef<HTMLDivElement>;
  private autoScrollInterval: any;
  private currentIndex = 0;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.productsService.getProducts(1, 32).subscribe({
      next: (res) => {
        const sorted = [...res.products].sort((a, b) => {
          if (b.offer !== a.offer) return b.offer - a.offer;
          return a.price - b.price;
        });

        this.products = sorted.slice(0, 10);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.startAutoScroll(), 400);
  }

  private startAutoScroll() {
    // Solo ejecutar en movil
    if (window.innerWidth > 768) return;

    const track = this.mobileTrack.nativeElement;

    this.autoScrollInterval = setInterval(() => {
      const cards = track.children;

      if (!cards.length) return;

      const cardWidth = (cards[0] as HTMLElement).offsetWidth + 16; // ancho + gap

      this.currentIndex++;

      if (this.currentIndex >= cards.length) {
        this.currentIndex = 0;
        track.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      track.scrollTo({
        left: cardWidth * this.currentIndex,
        behavior: 'smooth'
      });

    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.autoScrollInterval) clearInterval(this.autoScrollInterval);
  }
}
