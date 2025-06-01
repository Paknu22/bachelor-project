import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common'; 
import { LocalFile } from 'src/app/Interfaces/LocalFile';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-file-display',
  templateUrl: './file-display.component.html',
  styleUrls: ['./file-display.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class FileDisplayComponent  implements OnInit {
  @Input() images: LocalFile[] = [];

  @Output() imagesChange = new EventEmitter<LocalFile[]>();

  constructor() { }

  ngOnInit() {}

  async deleteImage(file: LocalFile) {
    try {
      await Filesystem.deleteFile({
        directory: Directory.Data,
        path: file.path,
      });
  
      this.images = this.images.filter(img => img.name !== file.name);
      this.imagesChange.emit(this.images);
      console.log(`Deleted file: ${file.path}`);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
  
}