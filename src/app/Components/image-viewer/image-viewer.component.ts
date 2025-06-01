import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ImageViewerComponent implements AfterViewInit {

  @Input() imageSrc!: string;
  @Input() initialMarker!: {x: number, y: number};
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  public img = new Image();

  marker: { x: number; y: number } = { x: 0 , y: 0 };
  markerRadius: number = 15;
  scale = 1;
  minScale = 0.5;
  maxScale = 3;
  offsetX = 0;
  offsetY = 0;

  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  private lastTouchDist = 0;

  constructor(private modalCtrl: ModalController) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.img.src = this.imageSrc;

    this.img.onload = () => {
      canvas.width = this.img.width;
      canvas.height = this.img.height;
      this.draw();
    };

    canvas.addEventListener('click', this.addAnnotation.bind(this));
    canvas.addEventListener('wheel', this.handleZoom.bind(this));

    //Desktop pan
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));

    //Mobile touch zoom/pan
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  draw() {
    requestAnimationFrame(() => {
      const canvas = this.canvasRef?.nativeElement;
      if (canvas && this.img.complete) {
        canvas.width = this.img.width;
        canvas.height = this.img.height;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.drawImage(this.img, 0, 0);
        this.ctx.beginPath();
        this.ctx.arc(this.marker.x, this.marker.y, this.markerRadius, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'red';
        this.ctx.fill();
        this.ctx.restore();
      }
    });

  }

  handleZoom(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.scale = Math.max(this.minScale, Math.min(this.scale + delta, this.maxScale));
    this.draw();
  }

  addAnnotation(event: MouseEvent | TouchEvent) {
    let clientX: number, clientY: number;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = (clientX - rect.left - this.offsetX) / this.scale;
    const y = (clientY - rect.top - this.offsetY) / this.scale;
    this.marker = { x, y };
    this.draw();
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.offsetX += dx;
    this.offsetY += dy;
    this.draw();
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.lastX = event.touches[0].clientX;
      this.lastY = event.touches[0].clientY;
      this.isDragging = true;
    } else if (event.touches.length === 2) {
      this.lastTouchDist = this.getTouchDistance(event);
      this.isDragging = false;
    }
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length === 1 && this.isDragging) {
      const dx = event.touches[0].clientX - this.lastX;
      const dy = event.touches[0].clientY - this.lastY;
      this.lastX = event.touches[0].clientX;
      this.lastY = event.touches[0].clientY;
      this.offsetX += dx;
      this.offsetY += dy;
      this.draw();
    } else if (event.touches.length === 2) {
      const newDist = this.getTouchDistance(event);
      const delta = newDist - this.lastTouchDist;
      this.lastTouchDist = newDist;
      const zoomAmount = delta * 0.005;
      this.scale = Math.max(this.minScale, Math.min(this.scale + zoomAmount, this.maxScale));
      this.draw();
    }
  }

  onTouchEnd(event: TouchEvent) {
    this.isDragging = false;
  }

  getTouchDistance(event: TouchEvent): number {
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  close() {
    this.modalCtrl.dismiss(this.marker);
  }

  
}
