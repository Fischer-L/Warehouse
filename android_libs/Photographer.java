package android_libs;

import android.hardware.Camera;

public class Photographer {

	private Photographer() {
	}
	
	// -- Static utility methods -- //
	
	private static void setupCamera(Camera c) {
		
		// Set preview size
		
		// Set continuous auto focus 
	}
	
	public static Camera openAndroidCamera(int cameraID) {
		
		Camera c;
		
		try {
			c = Camera.open(cameraID);
			
			Photographer.setupCamera(c);
			
		} catch (Exception e) {
			c= null;
			e.printStackTrace();
		}
			
		return c;
	}
	
	public static Photographer getPhotographer() {
		
		// Get the ids for back and front camera
		int backID = Integer.MIN_VALUE,
			frontID = Integer.MIN_VALUE,
			id = Camera.getNumberOfCameras();		
		
		Camera.CameraInfo cInfo = null;
		
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
		
		Photographer pg = null;
		
		id = (backID != Integer.MIN_VALUE) ? backID : frontID;
		if (id != Integer.MIN_VALUE) {
			
			Camera c = Photographer.openAndroidCamera(id);
			if (c != null) {	
				
				pg = new Photographer();
				
				pg.backCameraID = backID;
				
				pg.frontCameraID = frontID;
				
				if (id == backID) {
					
					pg.backCamera = c;
					pg.useBackCamera();
					
				} else if (id == frontID) {
					
					pg.frontCamera = c;
					pg.useFrontCamera();
				}
			}
		}
		
		return pg;		
	}
	
	// -- -- //
	
	private Camera backCamera,
				   frontCamera,
				   currentCamera;
	
	private int backCameraID = Integer.MIN_VALUE,
				frontCameraID = Integer.MIN_VALUE;

	public Camera getCurrentCamera() {
		return this.currentCamera;
	}
	
	public boolean hasBackCamera() {
		
		// When asking the existence of camera, there is a good possibility that user is going to use it.
		// Therefore we get one if not yet get
		if (this.backCamera == null && this.backCameraID != Integer.MIN_VALUE) {
			
			Camera c = Photographer.openAndroidCamera(this.backCameraID);
			if (c != null) {
				this.backCamera = c;
			}
		}
		
		return (this.backCamera != null);
	}
	
	public boolean hasFrontCamera() {
		
		if (this.frontCamera == null && this.frontCameraID != Integer.MIN_VALUE) {
			
			Camera c = Photographer.openAndroidCamera(this.frontCameraID);
			if (c != null) {
				this.frontCamera = c;
			}
		}
		
		return (this.frontCamera != null);
	}
	
	
	public boolean useBackCamera() {
		
		if (this.hasBackCamera()) {
			this.currentCamera = this.backCamera;
			return true;
		}
		return false;
	}
	
	public boolean useFrontCamera() {
		
		if (this.hasFrontCamera()) {
			this.currentCamera = this.frontCamera;
			return true;
		}
		return false;
	}
	
}
