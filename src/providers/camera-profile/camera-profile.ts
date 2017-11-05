import { Injectable } from '@angular/core';
import {Camera} from "@ionic-native/camera";
import {ImagePicker} from "@ionic-native/image-picker";
import {ImageResizerOptions} from "@ionic-native/image-resizer";

/*
  Generated class for the CameraProfileProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CameraProfileProvider {

  constructor( private camera: Camera,
               private image_picker: ImagePicker) {}

    /**
     * Opens the camera so that the user can take a picture
     * @return The url of the taken image
     */
    public open_camera(): Promise<string> {
        return this.camera.getPicture({
            // We want to have the URL to the file
            destinationType: this.camera.DestinationType ? this.camera.DestinationType.FILE_URI : 1,
            // Source of the images is the camera
            sourceType: this.camera.PictureSourceType ? this.camera.PictureSourceType.CAMERA : 1,
            // Encoding type is JPEG
            encodingType: this.camera.EncodingType ? this.camera.EncodingType.JPEG : 0,
            // Give us the full quality of the image, lower it for better performance
            quality: 100,
            // Allow editing of the image after its taken
            allowEdit: false,
            // When a image is taken via the camera also save it to the native photo album
            saveToPhotoAlbum: false,
            // Correct the orrientation of the image
            correctOrientation: true
        });
    }

    /**
     * Opens the albums
     * @return A collection of urls from the selected images
     */
    public open_albums(): Promise<Array<string>> {
        return this.image_picker.getPictures({
            quality: 100,
            maximumImagesCount: 1,
        });
    }

    /**
     * Resizes an image
     * @param options The resize options
     */
    public resize(options: ImageResizerOptions): Promise<any> {
        return Promise.resolve(options.uri);
    }

}
