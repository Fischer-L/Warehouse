package android_libs

import android.hardware.Camera;

public static class Camerality {
	
	public Camerality() {
		this.checkCamerasExistence();
	}
	
	public Camera backCamera, frontCamera;
	
	public Integer backCameraID = null,
				   frontCameraID = null;
	
	public void checkCamerasExistence() {

		if (this.backCameraID != null && this.frontCameraID != null) return;
		
		backCameraID = frontCameraID = Integer.MIN_VALUE;
		
		int id = Camera.getNumberOfCameras();		
		
		Camera.CameraInfo cInfo = new Camera.CameraInfo();
		
		for (id--; id >= 0; id--) {
			
			Camera.getCameraInfo(id, cInfo);
			
			if (cInfo != null) {
				
				if (cInfo.facing == Camera.CameraInfo.CAMERA_FACING_BACK) {
					backCameraID = id;
				} else if (cInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
					frontCameraID = id;
				}
			}
		}
	}
	
	public boolean hasBackCamera() {
		return !this.backCameraID.equals(Integer.MIN_VALUE);
	}
	
	public boolean hasFrontCamera() {
		return !this.frontCameraID.equals(Integer.MIN_VALUE);
	}
	
	public Camera getBackCamera() {
		
		if (!this.hasBackCamera()) return null;
		
		try {
			
			this.releaseCameras();
			this.backCamera = Camera.open(this.backCameraID);	
			
		} catch (Exception e) {
			
			this.backCamera = null;			
		}
		
		return this.backCamera;
	}
	
	public Camera getFrontCamera() {
		
		if (!this.hasFrontCamera()) return null;
		
		try {
			
			this.releaseCameras();
			this.frontCamera = Camera.open(this.frontCameraID);	
			
		} catch (Exception e) {
			
			this.frontCamera = null;			
		}
		
		return this.frontCamera;
	}
	
	public void releaseCameras() {
		
		if (this.backCamera != null) {
			this.backCamera.release();
			this.backCamera = null;
		}
		
		if (this.frontCamera != null) {
			this.frontCamera.release();
			this.frontCamera = null;
		}
	}
}
