import { Component, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-blueprint-static-viewer',
  templateUrl: './blueprint-static-viewer.component.html',
  styleUrls: ['./blueprint-static-viewer.component.scss'],
})
export class BlueprintStaticViewerComponent  implements AfterViewInit {
  @Input() imageSrc!: string;
  @Input() marker?: { x: number, y: number };
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private img = new Image();
  normalizedMarker?: { x: number, y: number };

  ngAfterViewInit(): void {
    this.img.src = this.imageSrc;
    this.img.onload = () => {
      const canvas = this.canvasRef.nativeElement;

      canvas.width = this.img.width;
      canvas.height = this.img.height;

      console.log('Image size:', this.img.width, this.img.height);
      this.ctx = canvas.getContext('2d')!;
      this.ctx.drawImage(this.img, 0, 0);

      if (this.marker) {
        const normX = this.marker.x / this.img.width;
        const normY = this.marker.y / this.img.height;

        const actualX = normX * this.img.width;
        const actualY = normY * this.img.height;

        console.log('Drawing marker at:', actualX, actualY);

        this.ctx.beginPath();
        this.ctx.arc(actualX, actualY, 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'red';
        this.ctx.fill();
      }
    };
  }


}