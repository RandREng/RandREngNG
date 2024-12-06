import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { CameraImage } from './camera-image';
import { CameraInitError } from './camera-init-error';
import { CameraMirrorProperties } from './camera-mirror-properties';
import { CameraUtility } from './camera-utility';

@Component({
    selector: 'lib-camera',
    templateUrl: 'camera.component.html',
    styleUrls: ['camera.component.scss'],
    imports: []
})
export class CameraComponent implements AfterViewInit, OnDestroy {
  private static DEFAULT_VIDEO_OPTIONS: MediaTrackConstraints = {
    facingMode: 'environment',
  };
  private static DEFAULT_IMAGE_TYPE = 'image/jpeg';
  private static DEFAULT_IMAGE_QUALITY = 0.92;

  /** Defines the max width of the webcam area in px */
  @Input() public width = 640;
  /** Defines the max height of the webcam area in px */
  @Input() public height = 480;
  /** Defines base constraints to apply when requesting video track from UserMedia */
  @Input() public videoOptions: MediaTrackConstraints =
    CameraComponent.DEFAULT_VIDEO_OPTIONS;
  /** Flag to enable/disable camera switch. If enabled, a switch icon will be displayed if multiple cameras were found */
  @Input() public allowCameraSwitch = true;
  /** Parameter to control image mirroring (i.e. for user-facing camera). ["auto", "always", "never"] */
  @Input() public mirrorImage: string | CameraMirrorProperties = 'auto';
  /** Flag to control whether an ImageData object is stored into the WebcamImage object. */
  @Input() public captureImageData = false;
  /** The image type to use when capturing snapshots */
  @Input() public imageType: string = CameraComponent.DEFAULT_IMAGE_TYPE;
  /** The image quality to use when capturing snapshots (number between 0 and 1) */
  @Input() public imageQuality: number = CameraComponent.DEFAULT_IMAGE_QUALITY;
  /** Flag to enable/disable resolution label. */
  @Input() public showResolution = false;

  /** EventEmitter which fires when an image has been captured */
  @Output() public imageCapture: EventEmitter<CameraImage> =
    new EventEmitter<CameraImage>();
  /** Emits a mediaError if webcam cannot be initialized (e.g. missing user permissions) */
  @Output() public initError: EventEmitter<CameraInitError> =
    new EventEmitter<CameraInitError>();
  /** Emits when the webcam video was clicked */
  @Output() public imageClick: EventEmitter<void> = new EventEmitter<void>();
  /** Emits the active deviceId after the active video device was switched */
  @Output() public cameraSwitched: EventEmitter<string> =
    new EventEmitter<string>();

  /** available video devices */
  public availableVideoInputs: MediaDeviceInfo[] = [];

  /** Indicates whether the video device is ready to be switched */
  public videoInitialized = false;

  /** If the Observable represented by this subscription emits, an image will be captured and emitted through
   * the 'imageCapture' EventEmitter
   */
  private triggerSubscription: Subscription | undefined;
  /** Index of active video in availableVideoInputs */
  private activeVideoInputIndex = -1;
  /** Subscription to switchCamera events */
  private switchCameraSubscription: Subscription | undefined;
  /** MediaStream object in use for streaming UserMedia data */
  private mediaStream: MediaStream | null = null;
  @ViewChild('video', { static: true })
  private video?: ElementRef<HTMLVideoElement>;
  /** Canvas for Video Snapshots */
  @ViewChild('canvas', { static: true })
  private canvas?: ElementRef<HTMLCanvasElement>;

  /** width and height of the active video stream */
  private activeVideoSettings: MediaTrackSettings | null = null;

  /**
   * If the given Observable emits, an image will be captured and emitted through 'imageCapture' EventEmitter
   */
  @Input()
  public set trigger(trigger: Observable<void>) {
    if (this.triggerSubscription) {
      this.triggerSubscription.unsubscribe();
    }

    // Subscribe to events from this Observable to take snapshots
    this.triggerSubscription = trigger.subscribe(() => {
      this.takeSnapshot();
    });
  }

  /**
   * If the given Observable emits, the active webcam will be switched to the one indicated by the emitted value.
   * @param switchCamera Indicates which webcam to switch to
   *   true: cycle forwards through available webcams
   *   false: cycle backwards through available webcams
   *   string: activate the webcam with the given id
   */
  @Input()
  public set switchCamera(switchCamera: Observable<boolean | string>) {
    if (this.switchCameraSubscription) {
      this.switchCameraSubscription.unsubscribe();
    }

    // Subscribe to events from this Observable to switch video device
    this.switchCameraSubscription = switchCamera.subscribe(
      (value: boolean | string) => {
        if (typeof value === 'string') {
          // deviceId was specified
          this.switchToVideoInput(value);
        } else {
          // direction was specified
          this.rotateVideoInput(value !== false);
        }
      }
    );
  }

  /**
   * Get MediaTrackConstraints to request streaming the given device
   * @param deviceId
   * @param baseMediaTrackConstraints base constraints to merge deviceId-constraint into
   * @returns
   */
  private static getMediaConstraintsForDevice(
    deviceId: string | null,
    baseMediaTrackConstraints: MediaTrackConstraints
  ): MediaTrackConstraints {
    const result: MediaTrackConstraints = baseMediaTrackConstraints
      ? baseMediaTrackConstraints
      : this.DEFAULT_VIDEO_OPTIONS;
    if (deviceId) {
      result.deviceId = { exact: deviceId };
    }

    return result;
  }

  /**
   * Tries to harvest the deviceId from the given mediaStreamTrack object.
   * Browsers populate this object differently; this method tries some different approaches
   * to read the id.
   * @param mediaStreamTrack
   * @returns deviceId if found in the mediaStreamTrack
   */
  private static getDeviceIdFromMediaStreamTrack(
    mediaStreamTrack: MediaStreamTrack
  ): string | undefined {
    if (
      mediaStreamTrack.getSettings &&
      mediaStreamTrack.getSettings() &&
      mediaStreamTrack.getSettings().deviceId !== undefined
    ) {
      return mediaStreamTrack.getSettings().deviceId;
    } else if (
      mediaStreamTrack.getConstraints &&
      mediaStreamTrack.getConstraints() &&
      mediaStreamTrack.getConstraints().deviceId
    ) {
      const deviceIdObj: ConstrainDOMString | undefined =
        mediaStreamTrack.getConstraints().deviceId;
      return CameraComponent.getValueFromConstrainDOMString(deviceIdObj);
    }
    return undefined;
  }

  /**
   * Tries to harvest the facingMode from the given mediaStreamTrack object.
   * Browsers populate this object differently; this method tries some different approaches
   * to read the value.
   * @param mediaStreamTrack
   * @returns facingMode if found in the mediaStreamTrack
   */
  private static getFacingModeFromMediaStreamTrack(
    mediaStreamTrack: MediaStreamTrack | null
  ): string | undefined {
    if (mediaStreamTrack) {
      if (
        mediaStreamTrack.getSettings &&
        mediaStreamTrack.getSettings() &&
        mediaStreamTrack.getSettings().facingMode !== undefined
      ) {
        return mediaStreamTrack.getSettings().facingMode;
      } else if (
        mediaStreamTrack.getConstraints &&
        mediaStreamTrack.getConstraints() &&
        mediaStreamTrack.getConstraints().facingMode !== undefined
      ) {
        const facingModeConstraint: ConstrainDOMString | undefined =
          mediaStreamTrack.getConstraints().facingMode;
        return CameraComponent.getValueFromConstrainDOMString(
          facingModeConstraint
        );
      }
    }
    return undefined;
  }

  /**
   * Determines whether the given mediaStreamTrack claims itself as user facing
   * @param mediaStreamTrack
   */
  private static isUserFacing(
    mediaStreamTrack: MediaStreamTrack | null
  ): boolean {
    const facingMode: string | undefined =
      CameraComponent.getFacingModeFromMediaStreamTrack(mediaStreamTrack);
    return facingMode ? 'user' === facingMode.toLowerCase() : false;
  }

  /**
   * Extracts the value from the given ConstrainDOMString
   * @param constrainDOMString
   */
  private static getValueFromConstrainDOMString(
    constrainDOMString: ConstrainDOMString | undefined
  ): string | undefined {
    if (constrainDOMString !== undefined) {
      if (constrainDOMString instanceof String) {
        return String(constrainDOMString);
      } else if (
        Array.isArray(constrainDOMString) &&
        Array(constrainDOMString).length > 0
      ) {
        return String(constrainDOMString[0]);
      } else if (typeof constrainDOMString === 'object') {
        const parameters: ConstrainDOMStringParameters | null =
          constrainDOMString as ConstrainDOMStringParameters;
        if (parameters && parameters.exact) {
          return String(parameters.exact);
        }
        if (parameters && parameters.ideal) {
          return String(parameters.ideal);
        }
      }
    }

    return undefined;
  }

  public ngAfterViewInit(): void {
    this.detectAvailableDevices()
      .then(() => {
        // start video
        this.switchToVideoInput(null);
      })
      .catch((err: string) => {
        this.initError.next({ message: err } as CameraInitError);
        // fallback: still try to load webcam, even if device enumeration failed
        this.switchToVideoInput(null);
      });
  }

  public ngOnDestroy(): void {
    this.stopMediaTracks();
    this.unsubscribeFromSubscriptions();
    this.mediaStream = null;
  }

  /**
   * Takes a snapshot of the current webcam's view and emits the image as an event
   */
  public takeSnapshot(): void {
    console.log('takeSnapshot');
    // set canvas size to actual video size
    const track = this.getActiveVideoTrack();
    const _capabilities = track?.getCapabilities();
    const _video = this.nativeVideoElement;
    const dimensions = { width: this.width, height: this.height };
    if (_video?.videoWidth) {
      dimensions.width = _video.videoWidth;
      dimensions.height = _video.videoHeight;
    }

    if (this.canvas && _video) {
      const _canvas = this.canvas.nativeElement;
      _canvas.width = dimensions.width;
      _canvas.height = dimensions.height;

      // paint snapshot image to canvas
      const context2d = _canvas.getContext('2d');
      context2d?.drawImage(_video, 0, 0);

      // read canvas content as image
      const mimeType: string = this.imageType
        ? this.imageType
        : CameraComponent.DEFAULT_IMAGE_TYPE;
      const quality: number = this.imageQuality
        ? this.imageQuality
        : CameraComponent.DEFAULT_IMAGE_QUALITY;
      const dataUrl: string = _canvas.toDataURL(mimeType, quality);

      // get the ImageData object from the canvas' context.
      let imageData: ImageData | undefined;

      if (this.captureImageData) {
        console.log('takeSnapshot - getImageData');
        imageData = context2d?.getImageData(
          0,
          0,
          _canvas.width,
          _canvas.height
        );
      }

      console.log('takeSnapshot - postImage');
      this.imageCapture.next(new CameraImage(dataUrl, mimeType, imageData));
    }
  }

  /**
   * Switches to the next/previous video device
   * @param forward
   */
  public rotateVideoInput(forward: boolean): void {
    if (this.availableVideoInputs && this.availableVideoInputs.length > 1) {
      const increment: number = forward
        ? 1
        : this.availableVideoInputs.length - 1;
      const nextInputIndex =
        (this.activeVideoInputIndex + increment) %
        this.availableVideoInputs.length;
      this.switchToVideoInput(
        this.availableVideoInputs[nextInputIndex].deviceId
      );
    }
  }

  /**
   * Switches the camera-view to the specified video device
   */
  public switchToVideoInput(deviceId: string | null): void {
    this.videoInitialized = false;
    this.stopMediaTracks();
    this.initWebcam(deviceId, this.videoOptions);
  }

  /**
   * Event-handler for video resize event.
   * Triggers Angular change detection so that new video dimensions get applied
   */
  public videoResize(): void {
    // here to trigger Angular change detection
  }

  public get videoWidth(): number {
    const videoRatio = this.getVideoAspectRatio();
    return Math.min(this.width, this.height * videoRatio);
  }

  public get videoHeight(): number {
    const videoRatio = this.getVideoAspectRatio();
    return Math.min(this.height, this.width / videoRatio);
  }

  public get videoStyleClasses(): string {
    let classes = '';

    if (this.isMirrorImage()) {
      classes += 'mirrored ';
    }

    return classes.trim();
  }

  public get nativeVideoElement(): HTMLVideoElement | undefined {
    return this.video?.nativeElement;
  }

  /**
   * Returns the video aspect ratio of the active video stream
   */
  private getVideoAspectRatio(): number {
    // calculate ratio from video element dimensions if present
    const videoElement = this.nativeVideoElement;
    if (
      videoElement &&
      videoElement.videoWidth &&
      videoElement.videoWidth > 0 &&
      videoElement.videoHeight &&
      videoElement.videoHeight > 0
    ) {
      return videoElement.videoWidth / videoElement.videoHeight;
    }

    // nothing present - calculate ratio based on width/height params
    return this.width / this.height;
  }

  /**
   * Init webcam live view
   */
  private initWebcam(
    deviceId: string | null,
    userVideoTrackConstraints: MediaTrackConstraints
  ): void {
    const _video = this.nativeVideoElement;
    if (_video) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // merge deviceId -> userVideoTrackConstraints
        const videoTrackConstraints =
          CameraComponent.getMediaConstraintsForDevice(
            deviceId,
            userVideoTrackConstraints
          );

        navigator.mediaDevices
          .getUserMedia({
            video: videoTrackConstraints,
          } as MediaStreamConstraints)
          .then((stream: MediaStream) => {
            this.mediaStream = stream;
            _video.srcObject = stream;
            _video.play();

            this.activeVideoSettings = stream.getVideoTracks()[0].getSettings();
            const activeDeviceId: string | undefined =
              CameraComponent.getDeviceIdFromMediaStreamTrack(
                stream.getVideoTracks()[0]
              );

            if (activeDeviceId) {
              this.cameraSwitched.next(activeDeviceId);
            }

            // Initial detect may run before user gave permissions, returning no deviceIds. This prevents later camera switches. (#47)
            // Run detect once again within getUserMedia callback, to make sure this time we have permissions and get deviceIds.
            this.detectAvailableDevices()
              .then(() => {
                this.activeVideoInputIndex = activeDeviceId
                  ? this.availableVideoInputs.findIndex(
                      (mediaDeviceInfo: MediaDeviceInfo) =>
                        mediaDeviceInfo.deviceId === activeDeviceId
                    )
                  : -1;
                this.videoInitialized = true;
              })
              .catch(() => {
                this.activeVideoInputIndex = -1;
                this.videoInitialized = true;
              });
          })
          .catch((err: DOMException) => {
            this.initError.next({
              message: err.message,
              mediaStreamError: err,
            } as CameraInitError);
          });
      } else {
        this.initError.next({
          message: 'Cannot read UserMedia from MediaDevices.',
        } as CameraInitError);
      }
    }
  }

  private getActiveVideoTrack(): MediaStreamTrack | null {
    return this.mediaStream ? this.mediaStream.getVideoTracks()[0] : null;
  }

  private isMirrorImage(): boolean {
    if (!this.getActiveVideoTrack()) {
      return false;
    }

    // check for explicit mirror override parameter
    {
      let mirror = 'auto';
      if (this.mirrorImage) {
        if (typeof this.mirrorImage === 'string') {
          mirror = String(this.mirrorImage).toLowerCase();
        } else {
          // WebcamMirrorProperties
          if (this.mirrorImage.x) {
            mirror = this.mirrorImage.x.toLowerCase();
          }
        }
      }

      switch (mirror) {
        case 'always':
          return true;
        case 'never':
          return false;
      }
    }

    // default: enable mirroring if webcam is user facing
    return CameraComponent.isUserFacing(this.getActiveVideoTrack());
  }

  /**
   * Stops all active media tracks.
   * This prevents the webcam from being indicated as active,
   * even if it is no longer used by this component.
   */
  private stopMediaTracks(): void {
    if (this.mediaStream && this.mediaStream.getTracks) {
      if (this.nativeVideoElement) {
        // pause video to prevent mobile browser freezes
        this.nativeVideoElement.pause();
      }

      // getTracks() returns all media tracks (video+audio)
      this.mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
        this.mediaStream?.removeTrack(track);
      });
    }
  }

  /**
   * Unsubscribe from all open subscriptions
   */
  private unsubscribeFromSubscriptions(): void {
    if (this.triggerSubscription) {
      this.triggerSubscription.unsubscribe();
    }
    if (this.switchCameraSubscription) {
      this.switchCameraSubscription.unsubscribe();
    }
  }

  /**
   * Reads available input devices
   */
  private detectAvailableDevices(): Promise<MediaDeviceInfo[]> {
    return new Promise((resolve, reject) => {
      CameraUtility.getAvailableVideoInputs()
        .then((devices: MediaDeviceInfo[]) => {
          this.availableVideoInputs = devices;
          resolve(devices);
        })
        .catch((err) => {
          this.availableVideoInputs = [];
          reject(err);
        });
    });
  }
}
