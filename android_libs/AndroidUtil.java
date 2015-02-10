package android_libs;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Bitmap.Config;
import android.os.Build;
import android.view.View;

/**
 * A class storing all kinds of helping utility
 */
public class AndroidUtil {
	
	/**
	 * @param ctx
	 * @param v
	 * @param drawableID
	 * 		The resource id to drawable
	 */
	@TargetApi(Build.VERSION_CODES.JELLY_BEAN)
	public static void setViewBackgroundDrawable(Context ctx, View v, int drawableID) {
		
		Resources res = ctx.getResources();
		
		if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.JELLY_BEAN) {
			
			v.setBackgroundDrawable(res.getDrawable(drawableID));
			
		} else {
		
			v.setBackground(res.getDrawable(drawableID));
		}
	}
	
	/**
	 * Capture the whole screen shot of one activity
	 * 
	 * @param act
	 * 		The activity
	 * @return
	 * 		Screen shot bitmap
	 */
	public static Bitmap captureScreenShot(Activity act) {
		
		View rootView = act.getWindow().getDecorView().getRootView();
		
		return AndroidUtil.captureScreenShot(rootView);
	}
	
	/**
	 * Capture screen shot
	 * 
	 * @param rootView
	 * 		The root view. All UIs (screen range) under this root view would be captured.
	 * @return
	 * 		Screen shot bitmap		 * 	
	 */
	public static Bitmap captureScreenShot(View rootView) {
		
	    Bitmap bitmap = Bitmap.createBitmap(rootView.getWidth(), rootView.getHeight(), Config.ARGB_8888);
	    		   
	    rootView.draw(new Canvas(bitmap));
	    
	    return bitmap;
	}

}
