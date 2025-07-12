import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CameraComponent, CameraImage, CameraInitError } from "CameraNG";

@Component({
  selector: 'app-root',
  imports: [CameraComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly title = signal('CameraTest');
  @ViewChild(CameraComponent) camera?: CameraComponent;


  onClick() {
    console.log(this.camera);
    this.camera?.takeSnapshot();
  }

  onCapture(image: CameraImage) {
    console.log(image);
  }

  public handleInitError(error: CameraInitError): void {
    console.log(error);
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log(deviceId);
  }


  public onClose() {
  }

}
