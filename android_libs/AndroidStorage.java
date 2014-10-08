import java.io.File;
import java.io.IOException;

import android.content.Context;
import android.os.Environment;

/**
 * A helper class for Android storage
 */
public class AndroidStorage {
	
	/**
	 * Tell if the external storage is writable
	 * 
	 * @return
	 * 		- Writable: true <br/>
	 * 		- Not writable: flase
	 */
	public static boolean isExternalStorageWritable() {
		return Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState());
	}
	
	/**
	 * Tell if the external storage is readable
	 * 
	 * @return
	 * 		- Readable: true <br/>
	 * 		- Not readable: flase
	 */
	public static boolean isExternalStorageReadable() {
		return Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState());
	}
	
	/**
	 * Create a external cache file for use
	 * 
	 * @param prefix
	 * 		{@link File#createTempFile(String, String, File)  File.createTempFile}
	 * @param suffix
	 * 		{@link File#createTempFile(String, String, File)  File.createTempFile}
	 * @param ctx
	 * 		The context obj which external cache file is associated with.
	 * @return
	 * 		- OK: The file <br/>
	 * 		- NG: null
	 * @throws IOException
	 */
	public static File createExternalCacheFile(String prefix, String suffix, Context ctx) throws IOException {
		return Storage.isExternalStorageWritable() ? File.createTempFile(prefix, suffix, ctx.getExternalCacheDir()) : null;
	}
	
	/**
	 * Create a private external file for use
	 * 
	 * @param filedir
	 * 		The name of directory saving file
	 * @param filename
	 * 		The file name
	 * @param ctx
	 * 		The context obj which private external file is associated with.
	 * @return
	 * 		- OK: The file <br/>
	 * 		- NG: null
	 * @throws IOException
	 */
	public static File createPrivateExternalFile(String filedir, String filename, Context ctx) throws IOException {		
		
		if (!Storage.isExternalStorageWritable()) return null;
			
		File privateDIR = new File(ctx.getExternalFilesDir(Environment.DIRECTORY_PICTURES), filedir);
		
		if (!privateDIR.exists()) {				
			if (!privateDIR.mkdir()) {
				throw new IOException("Fail on creating the private output image file : " + filedir + File.separator + filename);
			}
		}
		
		return new File(privateDIR.getPath() + File.separator + filename);		
	}
}
