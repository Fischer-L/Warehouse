package com.colorTapChallenge.externaLib;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.Canvas;
import android.graphics.Typeface;
import android.os.Build;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

/**
 * A class storing all kinds of helping utility
 */
public class AndroidUtil {
	
	/**
	 * Set view's font style
	 * 
	 * @param ctx
	 * 		The activity or app context
	 * @param subPathToFont
	 * 		The file name of the font data in the assets directory
	 * @param views
	 * 		Only can be the kind of view which is able to set font style
	 */
	public static void setFontStyle(Context ctx, String subPathToFont, View... views) {		
		
		if (views.length > 0) {
		
			Typeface face = Typeface.createFromAsset(ctx.getAssets(), subPathToFont);
			
			if (face != null) {
			
				for (View v : views) {
					if (v instanceof TextView) {				
						((TextView) v).setTypeface(face);				
					} else if (v instanceof Button) {
						((Button) v).setTypeface(face);
					}
				}
			}
		}
	}
	
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
	
	/**
	 * Make one {@link AlertDialog}
	 * 
	 * @param activity
	 * 		The activity which wants to use {@link AlertDialog}
	 * @param title
	 * 		The title of {@link AlertDialog}. If null, no title would be set
	 * @param content
	 * 		The content of {@link AlertDialog}. If null, no content would be set.
	 * @param neutralBtnTitle
	 * 		The title of neutral btn of {@link AlertDialog}. If null, no neutral btn would be set.
	 * @param positiveBtnTitle
	 * 		The title of positive btn of {@link AlertDialog}. If null, no positive btn would be set.	 * 		
	 * @param negativeBtnTitle
	 * 		The title of nagative btn of {@link AlertDialog}. If null, no nagative btn would be set.
	 * @return
	 */
	public static AlertDialog mkAlertDialog(Activity activity, String title, String content, String neutralBtnTitle, String positiveBtnTitle, String negativeBtnTitle) {
		
		AlertDialog.Builder ab = new AlertDialog.Builder(activity);
		
		if (title != null) ab.setTitle(title);
		
		if (content != null) ab.setMessage(content);
		
		if (neutralBtnTitle != null) ab.setNeutralButton(neutralBtnTitle, null);
		
		if (positiveBtnTitle != null) ab.setPositiveButton(positiveBtnTitle, null);
		
		if (negativeBtnTitle != null) ab.setNegativeButton(negativeBtnTitle, null);
		
		return ab.create();
	}

	/**
	 * Basically equal to {@link #mkAlertDialog(Activity, String, String, String, String, String)}.
	 * Except for using string resource id as parameter.
	 * 
	 * @param activity
	 * @param titleID
	 * @param contentID
	 * @param neutralBtnTitleID
	 * @param positiveBtnTitleID
	 * @param negativeBtnTitleID
	 * @return
	 */
	public static AlertDialog mkAlertDialog(Activity activity, Integer titleID, Integer contentID, Integer neutralBtnTitleID, Integer positiveBtnTitleID, Integer negativeBtnTitleID) {
		
		AlertDialog.Builder ab = new AlertDialog.Builder(activity);
		
		if (titleID != null) ab.setTitle(titleID);
		
		if (contentID != null) ab.setMessage(contentID);
		
		if (neutralBtnTitleID != null) ab.setNeutralButton(neutralBtnTitleID, null);
		
		if (positiveBtnTitleID != null) ab.setPositiveButton(positiveBtnTitleID, null);
		
		if (negativeBtnTitleID != null) ab.setNegativeButton(negativeBtnTitleID, null);
		
		return ab.create();
	}
}
