import { AfterViewInit, Component, ElementRef, Input, OnDestroy, computed, input, output, viewChild } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { CameraImage } from './camera-image';
import { CameraInitError } from './camera-init-error';
import { CameraMirrorProperties } from './camera-mirror-properties';
import { CameraUtility } from './camera-utility';

@Component({
  selector: 'r-Camera',
  imports: [],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent  implements AfterViewInit, OnDestroy {
  private static DEFAULT_VIDEO_OPTIONS: MediaTrackConstraints = {
    facingMode: 'environment',
  };
  private static DEFAULT_IMAGE_TYPE = 'image/jpeg';
  private static DEFAULT_IMAGE_QUALITY = 0.92;

  /** Defines the max width of the webcam area in px */
  public readonly width = input(640);
  /** Defines the max height of the webcam area in px */
  public readonly height = input(480);
  /** Defines base constraints to apply when requesting video track from UserMedia */
  public readonly videoOptions = input<MediaTrackConstraints>(CameraComponent.DEFAULT_VIDEO_OPTIONS);
  /** Flag to enable/disable camera switch. If enabled, a switch icon will be displayed if multiple cameras were found */
  public readonly allowCameraSwitch = input(true);
  /** Parameter to control image mirroring (i.e. for user-facing camera). ["auto", "always", "never"] */
  public readonly mirrorImage = input<string | CameraMirrorProperties>('auto');
  /** Flag to control whether an ImageData object is stored into the WebcamImage object. */
  public readonly captureImageData = input(false);
  /** The image type to use when capturing snapshots */
  public readonly imageType = input<string>(CameraComponent.DEFAULT_IMAGE_TYPE);
  /** The image quality to use when capturing snapshots (number between 0 and 1) */
  public readonly imageQuality = input<number>(CameraComponent.DEFAULT_IMAGE_QUALITY);
  /** Flag to enable/disable resolution label. */
  public readonly showResolution = input(false);

  /** EventEmitter which fires when an image has been captured */
  public readonly imageCapture = output<CameraImage>();
  /** Emits a mediaError if webcam cannot be initialized (e.g. missing user permissions) */
  public readonly initError = output<CameraInitError>();
  /** Emits when the webcam video was clicked */
  public readonly imageClick = output<void>();
  /** Emits the active deviceId after the active video device was switched */
  public readonly cameraSwitched = output<string>();

  /** available video devices */
  public availableVideoInputs: MediaDeviceInfo[] = [];

  /** Indicates whether the video device is ready to be switched */
  public videoInitialized = false;

  /** If the Observable represented by this subscription emits, an image will be captured and emitted through
   * the 'imageCapture' EventEmitter
   */
  /** Index of active video in availableVideoInputs */
  private activeVideoInputIndex = -1;
  /** MediaStream object in use for streaming UserMedia data */
  private mediaStream: MediaStream | null = null;
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');
  /** Canvas for Video Snapshots */
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  /** width and height of the active video stream */
  private activeVideoSettings: MediaTrackSettings | null = null;

  /**
   * If the given Observable emits, the active webcam will be switched to the one indicated by the emitted value.
   * @param switchCamera Indicates which webcam to switch to
   *   true: cycle forwards through available webcams
   *   false: cycle backwards through available webcams
   *   string: activate the webcam with the given id
   */

  /* TODO
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

  */

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
        this.initError.emit({ message: err } as CameraInitError);
        // fallback: still try to load webcam, even if device enumeration failed
        this.switchToVideoInput(null);
      });
  }

  public ngOnDestroy(): void {
    this.stopMediaTracks();
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
    const _video = this.nativeVideoElement();
    const dimensions = { width: this.width(), height: this.height() };
    if (_video?.videoWidth) {
      dimensions.width = _video.videoWidth;
      dimensions.height = _video.videoHeight;
    }

    const canvas = this.canvas();
    if (canvas && _video) {
      const _canvas = canvas.nativeElement;
      _canvas.width = dimensions.width;
      _canvas.height = dimensions.height;

      // paint snapshot image to canvas
      const context2d = _canvas.getContext('2d');
      context2d?.drawImage(_video, 0, 0);

      // read canvas content as image
      const imageType = this.imageType();
      const mimeType: string = imageType
        ? imageType
        : CameraComponent.DEFAULT_IMAGE_TYPE;
      const imageQuality = this.imageQuality();
      const quality: number = imageQuality
        ? imageQuality
        : CameraComponent.DEFAULT_IMAGE_QUALITY;
      const dataUrl: string = _canvas.toDataURL(mimeType, quality);

      // get the ImageData object from the canvas' context.
      let imageData: ImageData | undefined;

      if (this.captureImageData()) {
        console.log('takeSnapshot - getImageData');
        imageData = context2d?.getImageData(
          0,
          0,
          _canvas.width,
          _canvas.height
        );
      }

      console.log('takeSnapshot - postImage');
      this.imageCapture.emit(new CameraImage(dataUrl, mimeType, imageData));
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
    this.initWebcam(deviceId, this.videoOptions());
  }

  /**
   * Event-handler for video resize event.
   * Triggers Angular change detection so that new video dimensions get applied
   */
  public videoResize(): void {
    // here to trigger Angular change detection
  }

  public videoWidth = computed<number>(() => {
    const videoRatio = this.getVideoAspectRatio();
    return Math.min(this.width(), this.height() * videoRatio);
  });

  public videoHeight = computed<number> (() => {
    const videoRatio = this.getVideoAspectRatio();
    return Math.min(this.height(), this.width() / videoRatio);
  });

  public get videoStyleClasses(): string {
    let classes = '';

    if (this.isMirrorImage()) {
      classes += 'mirrored ';
    }

    return classes.trim();
  }

  public nativeVideoElement = computed<HTMLVideoElement | undefined> (() => this.video()?.nativeElement)

  /**
   * Returns the video aspect ratio of the active video stream
   */
  private getVideoAspectRatio(): number {
    // calculate ratio from video element dimensions if present
    const videoElement = this.nativeVideoElement();
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
    return this.width() / this.height();
  }

  /**
   * Init webcam live view
   */
  private initWebcam(
    deviceId: string | null,
    userVideoTrackConstraints: MediaTrackConstraints
  ): void {
    const _video = this.nativeVideoElement();
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
              this.cameraSwitched.emit(activeDeviceId);
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
            this.initError.emit({
              message: err.message,
              mediaStreamError: err,
            } as CameraInitError);
          });
      } else {
        this.initError.emit({
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
      const mirrorImage = this.mirrorImage();
      if (mirrorImage) {
        if (typeof mirrorImage === 'string') {
          mirror = String(mirrorImage).toLowerCase();
        } else {
          // WebcamMirrorProperties
          if (mirrorImage.x) {
            mirror = mirrorImage.x.toLowerCase();
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
      if (this.nativeVideoElement()) {
        // pause video to prevent mobile browser freezes
        this.nativeVideoElement()?.pause();
      }

      // getTracks() returns all media tracks (video+audio)
      this.mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
        this.mediaStream?.removeTrack(track);
      });
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
