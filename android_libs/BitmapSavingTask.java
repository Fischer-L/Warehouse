package android_libs

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;

import android.content.Context;
import android.graphics.Bitmap;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Handler;

/**
 * Take one bitmap and save the bitmap to jpg file
 */
public class BitmapSavingTask extends AsyncTask<Bitmap, Void, Void> {

	/**
	 * @param ctx
	 * 		Activity or application context
	 * @param dstFile
	 * 		The destination file storing the output jpg. Shall not be directory.
	 * @param listener
	 * 		{@link BitmapSavingTask.BitmapSavingTaskListener}
	 */
    public BitmapSavingTask(final Context ctx, final File dstFile, final BitmapSavingTask.BitmapSavingTaskListener listener) {
    	
    	super();
        this.ctx = ctx;
        this.dstFile = dstFile;
        this.listener = listener;
        this.handler = new Handler();
    }
	
	private final Context ctx;
    private final File dstFile;
    private final Handler handler;
    private final BitmapSavingTask.BitmapSavingTaskListener listener;

    @Override
    protected Void doInBackground(final Bitmap... params) {
        saveImage(params[0]);
        return null;
    }

    private void saveImage(final Bitmap image) {
    	
    	File file = this.dstFile;
    	
        try {
        	
        	if (file == null || !file.isFile()) throw new FileNotFoundException("Not specify the destination file for saving image");
        	
            file.getParentFile().mkdirs();
            
            image.compress(Bitmap.CompressFormat.JPEG, 100, new FileOutputStream(file));
            
            MediaScannerConnection.scanFile(
            		
            		this.ctx,
                    
            		new String[] {
                    	file.toString()
                    },
                    
                    null,
                    
                    new MediaScannerConnection.OnScanCompletedListener() {
            
            			@Override
                        public void onScanCompleted(final String path, final Uri uri) {
                        
            				if (listener != null) {
                            
            					handler.post(new Runnable() {
                                    @Override
                                    public void run() {
                                        listener.onSaved(uri);
                                    }
                                });
                            }
                        }
                    }
            );
            
        } catch (Exception e) {
        	
        	if (listener != null) listener.onError(image, e);
        } 
    }
    
    // -- Interfaces -- //
    
    /**
     * The listener to the saving task
     */
    public static interface BitmapSavingTaskListener {
		
		/**
		 * Called when bitmap is saved to jpg
		 * 
		 * @param uri
		 * 		The URI to the saved picture
		 */
		public void onSaved(Uri uri);
    	
		/**
		 * Called when error occurs
		 * 
		 * @param bitmap
		 * 		The original bitmap
		 * @param e
		 * 		The exception associating with error if there is one, or just null
		 */
		public void onError(Bitmap bitmap, Exception e);
    }
    
    // -- ! Interfaces -- // 
}
