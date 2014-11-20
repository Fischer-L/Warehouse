package android_libs;

import java.util.List;

import com.roomo.internalibs.RoomoEnv;
import com.roomo.internalibs.SimpleLog;

import android.app.Activity;
import android.hardware.Camera;
import android.util.Log;
import android.view.Surface;

/**
 * A class wraps Android camera and helps accessing Android camera
 */
public class PhotoCamera {	
	
	private PhotoCamera() {
	}
		
	// -- Public static methods -- //
	
	/**
	 * Get an instance of this class
	 * 
	 * @param cameraID
	 * 		The id of camera which is going to be used
	 * @return
	 * 		An instance of this class
	 * @throws ConnectCameraException
	 */
	public static PhotoCamera open(int cameraID) throws ConnectCameraException {
		
		PhotoCamera helper = null;
		
		try {
			
			Camera c = Camera.open(cameraID);	
			if (c != null) {
				
				helper = new PhotoCamera();
				helper.camera = c;

				helper.cameraID = cameraID;
			}
			
		} catch (Exception e) {
			
			ConnectCameraException ce = new ConnectCameraException(cameraID);
			
			SimpleLog.d(LOG_TAG, ce.getMessage(), ce);
			
			throw ce;
		}
		
		return helper;
	}
	
	/**
	 * Pick up one size from the given list so that the picked size is closest to the requested width and height in size and in ratio
	 * 
	 * @param w
	 * 		The requested width
	 * @param h
	 * 		The requested height
	 * @param sizes
	 * 		The size list to pick up from
	 * @return
	 * 		The optimal size.
	 * 
	 * @throws IllegalSizeException, Exception 
	 * @throws EmptySizeListException 
	 */
	public static PhotoSize getOptimalSize(int w, int h, List<Camera.Size> sizes) throws IllegalSizeException, EmptySizeListException {
		
		if (w < 0 || h < 0) throw new IllegalSizeException(w, h, "Negative number is illegal.");
		
		if (sizes == null || sizes.size() <= 0) throw new EmptySizeListException("Compute size with an empty size list!"); 
		
		final float RATIO_TOLERANCE = 0.05f;
		
		float targetRatio = (float) w / (float) h;
		
		float minDiff = Float.MAX_VALUE;
		
		Camera.Size size;
		
		int i,
			optIdx = -1,
			sizesLen = sizes.size();
		
		for (i = 0; i < sizesLen; i++) {
			
			size = sizes.get(i);
			
			if (Math.abs((float) size.width / (float) size.height - targetRatio) > RATIO_TOLERANCE) continue;
			
			if (Math.abs(size.width - w + size.height - h) < minDiff) {				
				optIdx = i;
				minDiff = Math.abs(size.width - w + size.height - h);
			}
		}
		
		
		if (optIdx < 0) {
			
			minDiff = Float.MAX_VALUE;
			
			for (i = 0; i < sizesLen; i++) {
				
				size = sizes.get(i);
				
				if (Math.abs(size.width - w + size.height - h) < minDiff) {				
					optIdx = i;
					minDiff = Math.abs(size.width - w + size.height - h);
				}				
			}			
		}
		
		return new PhotoSize(sizes.get(optIdx));
	}
	
	// -- //
	
	// -- Public static class, interface, enum -- //
	
	/**
	 * This exception means something wrong when connecting to device's camera
	 */
	public static class ConnectCameraException extends Exception {
		
		/**
		 * @param cameraID
		 * 		{@link #cameraID camera id}
		 */
		public ConnectCameraException(int cameraID) {
			super("Fail to connect camera #" + cameraID);
			this.cameraID = cameraID;
		}
		
		/**
		 * The id of camera to which fail to connect
		 */
		private int cameraID;
	}
	
	/**
	 * This exception means using illegal sizes 
	 */
	public static class IllegalSizeException extends Exception {
		
		/**
		 * 
		 * @param w
		 * 		The illegal width
		 * @param h
		 * 		The illegal height
		 * @param correctSizeHint
		 * 		The hint to correct size, which would be displayed to notice user upon happening.
		 */
		public IllegalSizeException(int w, int h, String correctSizeHint) {
			super(String.format("Illegal (width, height) = (%d, (%d) --> %s", w, h, correctSizeHint));
		}
	}
	
	/**
	 * This exception means processing on an empty size list
	 */
	public static class EmptySizeListException extends Exception {	
		
		public EmptySizeListException() {
			super();
		}
		
		public EmptySizeListException(String msg) {
			super(msg);
		}
	}
	
	/**
	 * Camera's orientation
	 */
	public static enum CameraOrientation {
		DEGREE_0, DEGREE_90, DEGREE_180, DEGREE_270;
		
		/**
		 * Convert from degree integer value
		 * 
		 * @param i
		 * 		The degree integer value
		 * @return
		 * 		- If OK: The corresponding orientation
		 * 		- If NG: null
		 */
		public static CameraOrientation fromInt(int i) {
			switch (i) {
				case 0: return DEGREE_0;
				case 90: return DEGREE_90;
				case 180: return DEGREE_180;
				case 270: return DEGREE_270;
			}
			return null;
		}
		
		/**
		 * Convert to degree integer value
		 * 
		 * @return
		 * 		The degree integer value
		 */
		public int toInt() {			
			switch (this) {
				case DEGREE_0: return 0;
				case DEGREE_90: return 90;
				case DEGREE_180: return 180;
				case DEGREE_270: return 270;
			}
			return -1;
		}
	}	
	
	/**
	 * Android's Camera.Size class is so hard to new one so we create this class
	 */
	public static class PhotoSize {
		
		public PhotoSize(int w, int h) {
			this.width = w;
			this.height = h;
		}
		
		public PhotoSize(Camera.Size cs) {
			this(cs.width, cs.height);
		}
		
		public int width;
		
		public int height;
		
	}
	
	// -- //
	
	// -- Environment variables -- //

	private final static boolean DEBUG = (RoomoEnv.MASTER_DEBUG == null) ? true : RoomoEnv.MASTER_DEBUG;
	
	private final static String LOG_TAG = PhotoCamera.class.getName() + "Log";
	
	// -- //
	
	/**
	 * The id of camera being used
	 */
	private int cameraID;
	
	/**
	 * The camera instance
	 */
	private Camera camera;
	
	/**
	 * The camera display orientation
	 */
	private PhotoCamera.CameraOrientation displayOrientation = CameraOrientation.DEGREE_0;
	
	/**
	 * The list of supported focus modes
	 */
	private List<String> supportedFocusModes;
	
	/**
	 * The list of supported flash modes
	 */
	private List<String> supportedFlashModes;
	
	/** 
	 * @return
	 * 		{@link #cameraID}
	 */
	public Camera getCamera() {
		return this.camera;
	}
	
	/**
	 * @return
	 * 		{@link #cameraID}
	 */
	public int getCameraID() {
		return this.cameraID;
	}
		
	/**
	 * @return
	 * 		The facing of camera being used
	 */
	public int getFacing() {
		
		Camera.CameraInfo info = new Camera.CameraInfo(); 
		
		Camera.getCameraInfo(this.cameraID, info);
		
		return info.facing;
	}
	
	/**
	 * @return
	 * 		The orientation of camera being used
	 */
	public PhotoCamera.CameraOrientation getOrientation() {
		
		Camera.CameraInfo info = new Camera.CameraInfo(); 
		
		Camera.getCameraInfo(this.cameraID, info);
		
		PhotoCamera.CameraOrientation orit = PhotoCamera.CameraOrientation.fromInt(info.orientation);
		
		if (orit == null) {			
			try {
				throw new Exception("Unknow android camera orientation : " + info.orientation);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		
		return orit;
	}

	/**
	 * @return
	 * 		The display orientation of camera being used
	 */
	public PhotoCamera.CameraOrientation getDisplayOrientation() {
		return this.displayOrientation;
	}
	
	/**
	 * Check if focus mode is supported
	 * 
	 * @param mode
	 * 		The mode to check
	 * @return
	 * 		- If OK: true
	 * 		- If NG: false
	 */
	public boolean isFocusModeSupported(String mode) {
		
		if (this.supportedFocusModes == null) {
			this.supportedFocusModes = this.camera.getParameters().getSupportedFocusModes();
		}
		return (this.supportedFocusModes != null) ? this.supportedFocusModes.contains(mode) : false;
	}
	
	/**
	 * Check if flash mode is supported
	 * 
	 * @param mode
	 * 		The mode to check
	 * @return
	 * 		- If OK: true
	 * 		- If NG: false
	 */
	public boolean isFlashModeSupported(String mode) {
		
		if (this.supportedFlashModes == null) {
			this.supportedFlashModes = this.camera.getParameters().getSupportedFlashModes();
		}
		return (this.supportedFlashModes != null) ? this.supportedFlashModes.contains(mode) : false;		
	}

	/**
	 * Set camera display orientation. Use this method instead of calling the method on camera instance so as to track display orientation
	 * 
	 * @param degree
	 * 		The orientation to set
	 * @return
	 * 		The current display orientation
	 */
	public PhotoCamera.CameraOrientation setDisplayOrientation(PhotoCamera.CameraOrientation o) {
		
		if (o != null) {
			this.displayOrientation = o;
			this.camera.setDisplayOrientation(o.toInt());
		}
		
		return this.getDisplayOrientation();
	}
	
	/**
	 * Set the image size used when taking picture.
	 * Since each camera has its own size support list, if requested size is not in the list, then,
	 * the size in the list which is closet to requested size would be set.
	 * 
	 * @param w
	 * 		The requested width
	 * @param h
	 * 		The requested height
	 * @return
	 * 		The current image size used when taking picture
	 * @throws Exception 
	 * @throws IllegalSizeException 
	 */
	public Camera.Size setPhotoSize(int w, int h) throws IllegalSizeException {
		
		try {
			
			Camera.Parameters params = this.camera.getParameters();
			
			PhotoSize size = PhotoCamera.getOptimalSize(w, h, params.getSupportedPictureSizes());
			
			params.setPictureSize(size.width, size.height);
			
			this.camera.setParameters(params);
			
		} catch (EmptySizeListException e) {
		}
		
		return this.camera.getParameters().getPictureSize();
	}
	
	/**
	 * Set the image size used when previewing camera.
	 * Since each camera has its own size support list, if requested size is not in the list, then,
	 * the size in the list which is closet to requested size would be set.
	 * 
	 * @param w
	 * 		The requested width
	 * @param h
	 * 		The requested height
	 * @return
	 * 		The current image size when previewing camera
	 * @throws Exception 
	 * @throws IllegalSizeException 
	 * @throws EmptySizeListException 
	 */
	public Camera.Size setPreviewSize(int w, int h) throws IllegalSizeException {
		
		Camera.Parameters params = this.camera.getParameters();
		
		try {
			PhotoSize size = PhotoCamera.getOptimalSize(w, h, params.getSupportedPreviewSizes());
			
			params.setPreviewSize(size.width, size.height);
			
			this.camera.setParameters(params);
			
		} catch (EmptySizeListException e) {
		}
	
		return this.camera.getParameters().getPreviewSize();
	}
	
	/**
	 * Set the focus mode
	 * 
	 * @param targetMode
	 * 		The requested focus mode
	 * @return
	 * 		The current focus mode
	 */
	public String setFocusMode(String targetMode) {
		
		if (this.isFocusModeSupported(targetMode)) {
			
			Camera.Parameters params = this.camera.getParameters();
			
			params.setFocusMode(targetMode);
			
			this.camera.setParameters(params);
		}
		
		return this.camera.getParameters().getFocusMode();
	}
	
	/**
	 * Set the flash mode
	 * 
	 * @param targetMode
	 * 		The requested flash mode
	 * @return
	 * 		{@link android.hardware.Camera.Parameters#getFlashMode() android.hardware.Camera.Parameters.getFlashMode}
	 */
	public String setFlashMode(String targetMode) {
		
		if (this.isFlashModeSupported(targetMode)) {
			
			Camera.Parameters params = this.camera.getParameters();
			
			params.setFlashMode(targetMode);
			
			this.camera.setParameters(params);
		}
		
		return this.camera.getParameters().getFlashMode();
	}
	
	/**
	 * Set camera preview's orientation and camera's orientation the same as display orientation.
	 * 
	 * @param activity
	 * 		The activity 
	 * @return
	 * 		{@link #getOrientation()}
	 */
	public PhotoCamera.CameraOrientation setOrientationAsScreen(Activity activity) {
		
		int displayRotation = activity.getWindowManager().getDefaultDisplay().getRotation();		
		switch (displayRotation) {
			case Surface.ROTATION_0: displayRotation = 0; break;
		    case Surface.ROTATION_90: displayRotation = 90; break;
		    case Surface.ROTATION_180: displayRotation = 180; break;
		    case Surface.ROTATION_270: displayRotation = 270; break;
		}
		
		int deviceRotation = (360 - displayRotation) % 360;
		
		int cameraOrientation = this.getOrientation().toInt();

		int cameraOrientationAdjusted = 0;
		int cameraDisplayOrientationAdjusted = 0;

		if (this.getFacing() == Camera.CameraInfo.CAMERA_FACING_FRONT) {
			
			cameraOrientationAdjusted = (cameraOrientation - deviceRotation + 360) % 360;
			 
			cameraDisplayOrientationAdjusted = (cameraOrientation + displayRotation) % 360;
			cameraDisplayOrientationAdjusted = (360 - cameraDisplayOrientationAdjusted) % 360;  // compensate the mirror
			 
		} else { // back-facing
			 
			cameraOrientationAdjusted = cameraDisplayOrientationAdjusted = (cameraOrientation + deviceRotation) % 360;
		}
				
		this.setDisplayOrientation(CameraOrientation.fromInt(cameraDisplayOrientationAdjusted));

		Camera.Parameters params = this.camera.getParameters();
		params.setRotation(cameraOrientationAdjusted);		
		this.camera.setParameters(params);
		
		if (DEBUG) {
			Log.d(LOG_TAG, String.format("Set camera#%d's (orientation, display orientation) = (%d, %d)", this.cameraID, cameraOrientationAdjusted, cameraDisplayOrientationAdjusted));
		}
		
		return this.getOrientation();
	}
}
