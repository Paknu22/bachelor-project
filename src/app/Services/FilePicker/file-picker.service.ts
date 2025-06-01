import { Injectable, OnInit } from '@angular/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LocalFile } from 'src/app/Interfaces/LocalFile';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { LoadingController, Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';


const IMAGE_DIR = 'stored-images';

@Injectable({ providedIn: 'root' })

export class FilePickerService implements OnInit{
  private imagesSubject = new BehaviorSubject<LocalFile[]>([]);

  private currentSessionFileNames: string[] = [];


  images$ = this.imagesSubject.asObservable(); 

  constructor(private platform: Platform, private loadingCtrl: LoadingController){}

  async ngOnInit() {
    await this.deleteAllFilesOnStartup();
    this.imagesSubject.next([]);
    this.currentSessionFileNames = [];
  }

  async loadFiles() {
    const images: LocalFile[] = [];

    const loading = await this.loadingCtrl.create({ message: 'Loading data...' });
    await loading.present();

    try {
      const result = await Filesystem.readdir({
        directory: Directory.Data,
        path: IMAGE_DIR
      });
      console.log('HERE: ', result);

      const fileNames = result.files.map(file => file.name);
      for (let f of fileNames) {
        const filePath = `${IMAGE_DIR}/${f}`;
        const readFile = await Filesystem.readFile({
          directory: Directory.Data,
          path: filePath
        });

        images.push({
          name: f,
          path: filePath,
          data: `data:application/octet-stream;base64,${readFile.data}`
        });  
      }

      this.imagesSubject.next(images);

    } catch (err) {
      console.log('err: ', err);
      await Filesystem.mkdir({
        directory: Directory.Data,
        path: IMAGE_DIR
      });
    } finally {
      loading.dismiss();
    }
  }

  async clearImagesFromDisk() {
    try {
      const result = await Filesystem.readdir({
        directory: Directory.Data,
        path: IMAGE_DIR
      });
  
      for (const file of result.files) {
        await Filesystem.deleteFile({
          directory: Directory.Data,
          path: `${IMAGE_DIR}/${file.name}`
        });
      }
  

      this.imagesSubject.next([]);
      this.currentSessionFileNames = [];
  
    } catch (err) {
      console.error('Error clearing images from disk:', err);
    }
  }


async captureImage(): Promise<LocalFile | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64, //NEEDS TO BE BASE64 INSTEAD OF URI
      source: CameraSource.Camera
    });

    if (!image.base64String) {
      throw new Error("No base64 data returned from camera");
    }

    const base64Data = image.base64String;
    const fileName = new Date().toISOString() + '.jpeg';

    await Filesystem.writeFile({
      directory: Directory.Data,
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
    });

    const localFile: LocalFile = {
      name: fileName,
      path: `${IMAGE_DIR}/${fileName}`,
      data: `data:image/jpeg;base64,${base64Data}`
    };

    this.currentSessionFileNames.push(fileName);
    this.loadFiles();
    return localFile;

  } catch (error) {
    console.error('Error capturing or saving image:', error);
    return null;
  }
}

  

  async saveImage(photo: Photo): Promise<LocalFile> {
    const base64Data = await this.readAsBase64(photo);
  
    const fileName = new Date().toISOString() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      directory: Directory.Data,
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data
    });
  
    console.log('saved image', savedFile);
    this.currentSessionFileNames.push(fileName);
  
    const localFile: LocalFile = {
      name: fileName,
      path: savedFile.uri,
      data: base64Data as string
    };
  
    this.loadFiles(); 
    return localFile;
  }
  

  async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      if (!photo.path) {
        throw new Error('Photo path is undefined on hybrid platform.');
      }
      const file = await Filesystem.readFile({
        path: photo.path
      });

      return file.data;
    }
    else {
      if (!photo.webPath) {
        throw new Error('Photo webPath is undefined on web platform.');
      }
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

async selectFile() {
  try {
    const result = await FilePicker.pickFiles({
      types: ['application/pdf', 'image/jpg', 'image/png', 'image/jepg'],
      readData: true,
    });

    if (result.files.length > 0) {
      const file = result.files[0];
      console.log('Picked file:', file);

      const base64Data = file.data;
      if (!base64Data) {
        throw new Error('Base64 data is missing from the file.');
      }

      const fileName = file.name;

      await Filesystem.writeFile({
        directory: Directory.Data,
        path: `${IMAGE_DIR}/${fileName}`,
        data: base64Data,
      });

      console.log('File saved to local filesystem');

      this.currentSessionFileNames.push(fileName);
      this.loadFiles(); // Refresh file list
    }
  } catch (error) {
    console.error('File picking error:', error);
  }
}


  async readFileAsBase64(file: { path?: string; blob?: Blob; }) {
    if (file.blob) {
      return await this.convertBlobToBase64(file.blob) as string;
    }
  
    if (file.path) {
      const response = await fetch(file.path);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob) as string;
    }
  
    throw new Error('No file data found');
  }
  

  async clearSessionFiles() {
    for (const fileName of this.currentSessionFileNames) {
      try {
        await Filesystem.deleteFile({
          directory: Directory.Data,
          path: `${IMAGE_DIR}/${fileName}`,
        });
      } catch (err) {
        console.warn(`Failed to delete ${fileName}:`, err);
      }
    }
  
    this.currentSessionFileNames = [];
    this.imagesSubject.next([]);
  }
  
async deleteAllFilesOnStartup() {
  try {
    const result = await Filesystem.readdir({
      directory: Directory.Data,
      path: IMAGE_DIR
    });

    for (const file of result.files) {
      await Filesystem.deleteFile({
        directory: Directory.Data,
        path: `${IMAGE_DIR}/${file.name}`,
      });
    }

    this.imagesSubject.next([]);
  } catch (err) {
    console.warn('Failed to delete all files on startup:', err);
  }
}

  setInitialFiles(remoteFiles: LocalFile[]) {
    this.imagesSubject.next(remoteFiles);
  }
  getSessionFileNames(): string[] {
    return [...this.currentSessionFileNames];
  }
}
