package android_libs;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import android.app.Activity;
import android.hardware.Camera;
import android.net.Uri;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.widget.FrameLayout;

import android_libs.AndroidStorage;
import android_libs.PhotoCamera.CameraOrientation;
import android_libs.PhotoCamera.ConnectCameraException;
import android_libs.PhotoCamera.EmptySizeListException;
import android_libs.PhotoCamera.IllegalSizeException;
import android_libs.PhotoCamera.PhotoSize;

/**
 * Photographer handles the access to, controls and switches between back & front camera. 
 * 
 */
public class Photographer {

	private Photographer() {
	}
	
	// -- Public interface, enum, class, constants -- //
	
	public static final String CACHE_IMG_FILE_PREFIX = "tmp_img_";
	public static final String CACHE_IMG_FILE_EXTENSION = ".jpg";
	
	public static final int PHOTO_SIZE_WIDTH_DEFAULT = 1920;
	public static final int PHOTO_SIZE_HEIGHT_DEFAULT = 1080;
	
	public static final int CAMERA_PREVIEW_SIZE_WIDTH_DEFAULT = 1280;
	public static final int CAMERA_PREVIEW_SIZE_HEIGHT_DEFAULT = 720;
	
	/**
	 * Represent camera's facing
	 */
	public static enum CameraFacing {
		Back, Front;
	}
	
	public static interface OnShoot {
		/**
		 * Called when shooting picture is done
		 * 
		 * @param imgUri
		 * 		The uri to image shot. Could be null if something wrong with shooting.
		 */
		public void onshoot(Uri imgUri);
	}
	
	/**
	 * The exception represents no camera available
	 */
	public static class NoCameraException extends Exception {
		public NoCameraException() {
			super();
		}
	}
	
	/**
	 * A simple logging utility class
	 */
	public static class SimpleLog {
		
		/**
		 * @param logTag
		 * 		{@link Log#d(String, String) Log.d}
		 * @param msg
		 * 		{@link Log#d(String, String) Log.d}
		 * @param e
		 * 		The exception to log
		 */
		public static void d(String logTag, String msg, Exception e) {
			Log.d(logTag, msg);
			e.printStackTrace();
		}
	}
	
	// -- -- //
	
	// -- Static utility methods -- //
	
	/**
	 * Get an instance of this class
	 * 
	 * @param activity
	 * 		{@link Photographer#activity}
	 * @param width
	 * 		{@link Photographer#expWidth}
	 * @param height
	 * 		{@link Photographer#expHeight}
	 * @param backCameraSurface
	 * 		{@link Photographer#backCameraSurface}
	 * @param frontCameraSurface
	 * 		{@link Photographer#frontCameraSurface}
	 * @return
	 * 		The instance of this class
	 * @throws ConnectCameraException
	 * @throws NoCameraException
	 */
	public static Photographer hire(Activity activity, int width, int height, SurfaceView backCameraSurface, SurfaceView frontCameraSurface) throws ConnectCameraException, NoCameraException {

		/// Get the ids for back and front camera
		
		int backID = Integer.MIN_VALUE,
			frontID = Integer.MIN_VALUE,
			id = Camera.getNumberOfCameras();		
		
		Camera.CameraInfo cInfo = new Camera.CameraInfo();
		
		for (id--; id >= 0; id--) {
			
			Camera.getCameraInfo(id, cInfo);
			
			if (cInfo != null) {
				
				if (cInfo.facing == Camera.CameraInfo.CAMERA_FACING_BACK) {
					backID = id;
				} else if (cInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
					frontID = id;
				}
			}
		}
		
		///		
		
		
		id = (backID != Integer.MIN_VALUE) ? backID : frontID; // Back camera is default so try it first
		if (id == Integer.MIN_VALUE) {
			
			NoCameraException e = new NoCameraException();
			
			SimpleLog.d(LOG_TAG, "No camera available on the device", e);
			
			throw e;
			
		} else {
			
			Photographer pg = null;
			
			if (DEBUG) Log.d(LOG_TAG, "Get camera : " + id);

			pg = new Photographer();
			
			pg.activity = activity;
			
			pg.backCameraSurface = backCameraSurface;
			
			pg.frontCameraSurface = frontCameraSurface;
			
			pg.expWidth = width;
			
			pg.expHeight = height;
			
			pg.backCameraID = backID;
			
			pg.frontCameraID = frontID;
			
			try {
				pg.useCamera((id == backID) ? CameraFacing.Back : CameraFacing.Front);
			} catch (ConnectCameraException e) {
				pg = null;
				throw e;
			}
			
			return pg;
		}
	}
		
	// -- -- //
	
	// -- Private environment stuff -- //
	
	private static final boolean DEBUG = true;
	
	private static final String LOG_TAG = "PhotographerDebugging";
	
	/**
	 * The flag marking sleeping state
	 */
	private boolean FLAG_SLEEP = false;
	
	// -- -- //
	
	/**
	 * The activity associated with
	 */
	private Activity activity;
	
	/**
	 * The surface view to preview back camera on
	 */
	private SurfaceView backCameraSurface;
	
	/**
	 * The surface view to preview front camera on
	 */
	private SurfaceView frontCameraSurface;
	
	/**
	 * The preview surface of back camera
	 */
	private PreviewSurface backCameraPreview;
	
	/**
	 * The preview surface of front camera
	 */
	private PreviewSurface frontCameraPreview;
	
	/**
	 * The expected picture width being requested
	 */
	private int expWidth;
	
	/**
	 * The expected picture height being requested
	 */
	private int expHeight;
		
	/**
	 * The back camera helper
	 */
	private PhotoCamera backCamera;
	
	/**
	 * The front camera helper
	 */
	private PhotoCamera frontCamera;
	
	/**
	 * The back camera id
	 */
	private int backCameraID = Integer.MIN_VALUE;
	
	/**
	 * The front camera id
	 */
	private int frontCameraID = Integer.MIN_VALUE;
	
	/**
	 * The id of camera currently in use
	 */
	private int currentCameraID = Integer.MIN_VALUE;
	
	/**
	 * Set up camera for use
	 * 
	 * @param c
	 * 		The camera helper to set up 
	 * @throws EmptySizeListException 
	 * @throws IllegalSizeException 
	 */
	private void setupCamera(PhotoCamera c) {
		
		if (this.isLaidOff()) return;
		
		// Set camera parameters
		
		Camera.Parameters params = c.getCamera().getParameters();
		
		if (c.isFocusModeSupported(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE)) {			
			params.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE);			
		}
		
		if (c.isFlashModeSupported(Camera.Parameters.FLASH_MODE_AUTO)) {			
			params.setFlashMode(Camera.Parameters.FLASH_MODE_AUTO);			
		}
				
		PhotoSize size = new PhotoSize(PHOTO_SIZE_WIDTH_DEFAULT, PHOTO_SIZE_HEIGHT_DEFAULT);
		
		try {
			
			size = PhotoCamera.getOptimalSize(this.expWidth, this.expHeight, params.getSupportedPictureSizes());
			
		} catch (IllegalSizeException e) {
			
			if (DEBUG) SimpleLog.d(LOG_TAG, e.getMessage(), e);
			e.printStackTrace();
			
		} catch (EmptySizeListException e) {
			
			if (DEBUG) SimpleLog.d(LOG_TAG, e.getMessage(), e);
			e.printStackTrace();
		}	
		
		params.setPictureSize(size.width, size.height);
		
		c.getCamera().setParameters(params);
	}
	
	/**
	 * Release and stop preview on all cameras
	 */
	private void releaseCameras() {
		
		if (this.backCameraPreview != null) {
			try {
				this.backCameraPreview.stop();
			} catch (Exception e) {
				SimpleLog.d(LOG_TAG, "Error on stopping back camera preview", e);
			}
		}
		
		if (this.backCamera != null) {
			
			if (DEBUG) Log.d(LOG_TAG, "Release back camera");

			try {
				this.backCamera.getCamera().release();
			} catch (Exception e) {
				SimpleLog.d(LOG_TAG, "Error on releasing back camera", e);
			}
			this.backCamera = null;
		}
		
		if (this.frontCameraPreview != null) {			
			try {
				this.frontCameraPreview.stop();
			} catch (Exception e) {
				SimpleLog.d(LOG_TAG, "Error on stopping front camera preview", e);
			}
		}
		
		if (this.frontCamera != null) {
			
			if (DEBUG) Log.d(LOG_TAG, "Release front camera");

			try {
				this.frontCamera.getCamera().release();
			} catch (Exception e) {
				SimpleLog.d(LOG_TAG, "Error on releasing front camera", e);
			}
			this.frontCamera = null;
		}		
	}
	
	/**
	 * Get the camera currently in use
	 * 
	 * @return
	 * 		the camera currently in use
	 */
	private PhotoCamera getCurrentCamera() {
		
		if (this.currentCameraID == this.backCameraID) {
			return this.backCamera;
		} else if (this.currentCameraID == this.frontCameraID) {
			return this.frontCamera;
		} else {
			// TBW:
			// Should handle the exceptions of
			// - currentCameraID == Integer.MIN_VALUE but backCameraID || frontCameraID != Integer.MIN_VALUE
			// - currentCameraID == Integer.MIN_VALUE and backCameraID && frontCameraID == Integer.MIN_VALUE
			return null;
		}
	}
	
	/**
	 * @return
	 * 		- If laid off: true <br/>
	 * 		- If not laid off: false <br/>
	 */
	public boolean isLaidOff() {
		return this.activity == null;
	}
	
	/**
	 * @return
	 * 		- If sleeping: true <br/>
	 * 		- If not sleeping: false
	 */
	public boolean isSleeping() {
		return this.isLaidOff() ? true : this.FLAG_SLEEP;
	}
	
	/**
	 * Tell the existence of camera
	 * 
	 * @param facing
	 * 		{@link Photographer.CameraFacing}
	 * @return
	 * 		- If having: true <br/>
	 * 		- If not having: false
	 */
	public boolean hasCamera(Photographer.CameraFacing facing) {
		return this.isLaidOff() ? false : (facing == CameraFacing.Back) ? this.backCameraID != Integer.MIN_VALUE : this.frontCameraID != Integer.MIN_VALUE;
	}
		
	/**
	 * Use the requested camera. No effect if the requested doesn't exist.
	 * 
	 * @param facing
	 * 		{@link Photographer.CameraFacing the facing of requested camera}
	 * @return
	 * 		- If OK: {@link Photographer.CameraFacing the facing of camera in use}
	 * 		- If NG or laid off or sleeping: null
	 * @throws ConnectCameraException
	 */
	public Photographer.CameraFacing useCamera(Photographer.CameraFacing facing) throws ConnectCameraException {
		
		if (this.isLaidOff() || this.isSleeping()) return null;
		
		if (this.hasCamera(facing)) {
			
			this.releaseCameras();
			
			if (facing == CameraFacing.Back) {
				
				PhotoCamera c = PhotoCamera.open(this.backCameraID);
				if (c != null) {
					
					if (DEBUG) Log.d(LOG_TAG, "Use back camera / id = " + this.backCameraID);
					
					this.setupCamera(c);
					
					this.backCamera = c;
					
					this.currentCameraID = this.backCameraID;
					
					if (this.backCameraPreview == null) {						
						this.backCameraPreview = new PreviewSurface(this, facing);
					}
					this.backCameraPreview.start();
				}
				
			} else if (facing == CameraFacing.Front) {
				
				PhotoCamera c = PhotoCamera.open(this.frontCameraID);
				if (c != null) {
					
					if (DEBUG) Log.d(LOG_TAG, "Use front camera / id = " + this.frontCameraID);
					
					this.setupCamera(c);
					
					this.frontCamera = c;
					
					this.currentCameraID = this.frontCameraID;
					
					if (this.frontCameraPreview == null) {
						this.frontCameraPreview = new PreviewSurface(this, facing);
					}
					this.frontCameraPreview.start();
				}
			}			
		}
		
		return (this.currentCameraID == this.backCameraID) ? CameraFacing.Back : CameraFacing.Front;
	}
	
	/**
	 * A quick method to switch between back and front camera. No effect if only one camera exists.
	 * 
	 * @return
	 * 		{@link #useCamera(CameraFacing)}
	 * @throws ConnectCameraException
	 */
	public Photographer.CameraFacing switchCamera() throws ConnectCameraException {
		
		if (this.currentCameraID == this.backCameraID) {
			return this.useCamera(CameraFacing.Front);
		} else {
			return this.useCamera(CameraFacing.Back);
		}
	}
	
	/**
	 * Focus camera in use
	 * 
	 * @param cb
	 * 		{@link Camera.AutoFocusCallback}
	 */
	public void focusCamera(Camera.AutoFocusCallback cb) {
		if (this.isLaidOff() == false && this.isSleeping() == false) this.getCurrentCamera().getCamera().autoFocus(cb);
	}
	
	/**
	 * @return
	 * 		- If OK: The flash mode of current camera in use 
	 *		- If sleeping or laid off: null
	 */
	public String getFlashMode() {
		return (this.isLaidOff() || this.isSleeping()) ? null : this.getCurrentCamera().getCamera().getParameters().getFlashMode();
	}
	
	/**
	 * Set the flash mode of current camera in use
	 * 
	 * @param mode
	 * 		The mode to set
	 * @return
	 * 		- If OK: {@link PhotoCamera#setFlashMode(String) PhotoCamera.setFlashMode}
	 * 		- If laid off or sleeping: null
	 */
	public String setFlashMode(String mode) {
		return (this.isLaidOff() || this.isSleeping()) ? null : this.getCurrentCamera().setFlashMode(mode);
	}
	
	/**
	 * Shoot a picture
	 * 
	 * @param onshot
	 * 		{@link Photographer.OnShoot}
	 */
	public void shoot(final OnShoot onshot) {
		
		if (this.isLaidOff() || this.isSleeping() || onshot == null) return; // Take a shot but not to handle result. Strange. Return.
		
		this.focusCamera(new Camera.AutoFocusCallback() { // Before shoting, take a focus
			
			@Override
			public void onAutoFocus(boolean success, Camera c) { // After focusing, take a shot
					
				c.takePicture(null, null, new Camera.PictureCallback() {
					
					@Override
					public void onPictureTaken(byte[] data, Camera c) {
						
						File picFile = null;

						if (AndroidStorage.isExternalStorageWritable()) {
							try {
								picFile = File.createTempFile(CACHE_IMG_FILE_PREFIX, CACHE_IMG_FILE_EXTENSION, activity.getApplicationContext().getExternalCacheDir());
							} catch (IOException e) {
								SimpleLog.d(LOG_TAG, "Fail on creating the external cache jpg file!", e);
							}
						}
												
						if (picFile != null) {

					        try {
					        	
					            FileOutputStream fos = new FileOutputStream(picFile);
					            fos.write(data);
					            fos.close();
					            
					            onshot.onshoot(Uri.fromFile(picFile));
								return;
					            
					        } catch (FileNotFoundException e) {
					        	
					        	picFile = null;
					            SimpleLog.d(LOG_TAG, "Found no external chache img file : ", e);
					            
					        } catch (IOException e) {
					        	
					        	picFile = null;
					        	SimpleLog.d(LOG_TAG, "Error accessing external chache img file: ", e);
					        }
						}
						
						onshot.onshoot(null);
					}			
				});				
			}			
		});
	}
	
	/**
	 * Lay off photographer.
	 * Once laying off, all methods would go useless. No turning back.
	 */
	public void layoff() {
		
		if(this.isSleeping()) return;
		
		if (DEBUG) Log.d(LOG_TAG, "Lay off photographer");
		
		this.releaseCameras();		
		this.activity = null;
		this.backCameraSurface = null;
		this.backCameraPreview = null;
		this.frontCameraSurface = null;
		this.frontCameraPreview = null;
	}
	
	/**
	 * Send photographer to sleep.
	 * In sleeping state, all camera-accessing operation do not perform.
	 */
	public void sleep() {

		if (this.isLaidOff() || this.isSleeping()) return;
		
		if (DEBUG) Log.d(LOG_TAG, "Put cameras asleep");
		
		this.FLAG_SLEEP = true;
		
		this.releaseCameras();
	}
	
	/**
	 * Wake up photographer from the sleeping state to work.
	 * 
	 * @throws ConnectCameraException
	 */
	public void wakeup() throws ConnectCameraException {
		
		if (this.isLaidOff() || !this.isSleeping()) return;
		
		if (DEBUG) Log.d(LOG_TAG, "Wake up camera : " + this.currentCameraID);
		
		this.FLAG_SLEEP = false;
		
		try {
			this.useCamera(
				(this.currentCameraID == this.backCameraID) ? CameraFacing.Back : CameraFacing.Front
			);
		} catch (ConnectCameraException e) {
			this.sleep(); // Something wrong go sleeping again.
			throw e;
		}
	}
	
	// -- Classes -- //
	
	/**
	 * The class PreviewSurface controls the camera preview operations.
	 */
	private static class PreviewSurface implements SurfaceHolder.Callback {
		
		/**
		 * @param photographer
		 * 		{@link #photographer}
		 * @param facing
		 * 		{@link #facing}
		 */
		public PreviewSurface(Photographer photographer, CameraFacing facing) {

			this.facing = facing;
			this.photographer = photographer;
			
			if (DEBUG) Log.d(LOG_TAG, "New PreviewSurface for camera : " + this.getCamera().getCameraID());
			this.getSurfaceView().getHolder().addCallback(this);
		}
		
		/**
		 * A flag marking preview operation should go or not
		 */
		private boolean FLAG_go_preview = false;
		
		/**
		 * The facing of camera being previewed on
		 */
		private CameraFacing facing;
		
		/**
		 * The instance of the class Photographer
		 */
		private Photographer photographer;
		
		/**
		 * @return
		 * 		The camera being previewed on
		 */
		private PhotoCamera getCamera() {
			return (facing == CameraFacing.Back) ? this.photographer.backCamera : this.photographer.frontCamera;
		};

		/**
		 * @return
		 * 		The surface view on which the preview image is rendered
		 */
		private SurfaceView getSurfaceView() {
			return (facing == CameraFacing.Back) ? this.photographer.backCameraSurface : this.photographer.frontCameraSurface;
		};
		
		/**
		 * Start previewing. This makes the surface view visible as well.
		 */
		public void start() {
			
			if (this.getCamera() != null) {
				
				if (DEBUG) Log.d(LOG_TAG, "Start preview camera : " + this.getCamera().getCameraID());
				
				this.FLAG_go_preview = true;
				this.getSurfaceView().setVisibility(View.VISIBLE); // Changing visibility to trigger this.surfaceChanged automatically
			}
		}
		
		/**
		 * Stop previewing. This makes the surface view gone as well.
		 */
		public void stop() {
			
			if (this.getCamera() != null) {
				
				if (DEBUG) Log.d(LOG_TAG, "Stop preview camera : " + this.getCamera().getCameraID());
				
				this.FLAG_go_preview = false;
				this.getCamera().getCamera().stopPreview();
				this.getSurfaceView().setVisibility(View.GONE); // Changing visibility to trigger this.surfaceChanged automatically
			}
		}
		
		// -- Preview surface lifecycle -- //
		
		@Override
		public void surfaceCreated(SurfaceHolder holder) {
		}

		@Override
		public void surfaceDestroyed(SurfaceHolder holder) {
		}

		@Override
		public void surfaceChanged(SurfaceHolder holder, int format, int w, int h) {
			
			if (holder.getSurface() == null) return;
			
			if (this.FLAG_go_preview == true && this.getCamera() != null) {
					            
	            try {
	            	if (DEBUG) Log.d(LOG_TAG, "Start surfaceChanged preview camera : " +this.getCamera().getCameraID());
					
	            	PhotoCamera pc = this.getCamera();
	            	
	            	Camera c = pc.getCamera();

	            	c.stopPreview();
					
	            	/// Adjust the sizes and orientation of camera & preview surface
	            	
	            	pc.setOrientationAsScreen(this.photographer.activity); // Do this first is important
	            	
	            	CameraOrientation o = pc.getDisplayOrientation();
	            	
		            	/// Compute the optimal preview size and surface view size based on the layout size of surface view to avoid preview distortion
		            	
		            	PhotoSize previewSize = new PhotoSize(CAMERA_PREVIEW_SIZE_WIDTH_DEFAULT, CAMERA_PREVIEW_SIZE_HEIGHT_DEFAULT);
		            	
		            	int optSurfaceW, optSurfaceH;
		            	
						if (o == CameraOrientation.DEGREE_0 || o == CameraOrientation.DEGREE_180) {
							
							try {
								
								previewSize = PhotoCamera.getOptimalSize(w, h, c.getParameters().getSupportedPreviewSizes());
							
							} catch (IllegalSizeException e) {
								
								if (DEBUG) SimpleLog.d(LOG_TAG, e.getMessage(), e);
								e.printStackTrace();
								
							} catch (EmptySizeListException e) {
								
								if (DEBUG) SimpleLog.d(LOG_TAG, e.getMessage(), e);
								e.printStackTrace();
							}	
							
							optSurfaceW = previewSize.width;
							optSurfaceH = previewSize.height;
							
						} else {
							
							try {
								
								previewSize = PhotoCamera.getOptimalSize(h, w, c.getParameters().getSupportedPreviewSizes());
	
							} catch (IllegalSizeException e) {
								
								if (DEBUG) SimpleLog.d(LOG_TAG, e.getMessage(), e);
								e.printStackTrace();
								
							} catch (EmptySizeListException e) {
								
								if (DEBUG) SimpleLog.d(LOG_TAG, e.getMessage(), e);
								e.printStackTrace();
							}
							
							optSurfaceW = previewSize.height;
							optSurfaceH = previewSize.width;
						}
						
						///
					
						/// Make sure the optimal surface size is not too bigger than the layout size of surface view so the preview image rendered on surface view will not too big.
						/// Also, make sure the the optimal surface size is not smaller than the layout size of surface view so the preview image rendered can fill up surface view
						
						float ratioW, ratioH;
						
						if (w > 0 && h > 0) {
							
							ratioW = (float) optSurfaceW / (float) w;
							ratioH = (float) optSurfaceH / (float) h;
							
							if (   ratioW > 1.1f || ratioH > 1.1f
								|| ratioW < 1.0f || ratioH < 1.0f
							) {
							
								if (ratioW <= ratioH) {
	
									optSurfaceW = w;
									optSurfaceH = (int) (optSurfaceH / ratioW);
									
								} else {
									
									optSurfaceH = h;
									optSurfaceW = (int) (optSurfaceW / ratioH);
								}
							}
						}
							
						///
					
					if (DEBUG) {
						Log.d(LOG_TAG, String.format("(initSurfaceW, initSurfaceH) = (%d, %d)", w, h));
						Log.d(LOG_TAG, String.format("(optSurfaceW, optSurfaceH) = (%d, %d)",  optSurfaceW, optSurfaceH));
						Log.d(LOG_TAG, String.format("(previewSize.width, previewSize.height) = (%d, %d)", previewSize.width, previewSize.height));
					}
					
					try {
						
						pc.setPreviewSize(previewSize.width, previewSize.height);
						
					} catch (IllegalSizeException e) {
						
						if (DEBUG) SimpleLog.d(LOG_TAG, e.getMessage(), e);
						e.printStackTrace();
						
					}
					
					// WARNING:
					// Here we assume the parent of surface view is FrameLayout type...
					// Not good...TBW...
					this.getSurfaceView().setLayoutParams(new FrameLayout.LayoutParams(optSurfaceW, optSurfaceH));
					
					///
					
					c.setPreviewDisplay(holder);
					c.startPreview();
					
					if (DEBUG) {
						Log.d(LOG_TAG, "End surfaceChanged preview camera : " +this.getCamera().getCameraID());
					}
					
				} catch (IOException e) {
					SimpleLog.d(LOG_TAG, "Error setting camera preview: ", e);
				}
			}
		}
		
		// -- //
	}
	
	// -- -- //
}

