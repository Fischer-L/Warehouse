package android_libs;

import android.app.Activity;
import android.content.IntentSender;
import android.os.Bundle;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.games.Games;
import com.google.android.gms.games.leaderboard.Leaderboards;

/**
 * This class deals with the operations of Google Android Game Services
 */
public class AndroidGameService {

	public AndroidGameService(Activity hostActivity, OnConnectionListener onConnListener) {

		this.hostActivity = hostActivity;

		this.onConnListener = onConnListener;

		this.gAPI = (new GoogleApiClient.Builder(hostActivity))
								  		.addApi(Games.API)
								  		.addScope(Games.SCOPE_GAMES)
								  		.addConnectionCallbacks(this.privateOnConn)
								  		.addOnConnectionFailedListener(this.privateOnConnFailed)
								  		.build();
	}

	// -- Static members -- //

    /**
     * The intent request code for requesting fixing-connection activity
     */
	public static final int CODE_REQUEST_FIX_FOR_CONN_FAIL = 1991;

    /**
     * The intent request code for requesting leaderboard activity
     */
	public static final int CODE_REQUEST_LEADERBOARD = CODE_REQUEST_FIX_FOR_CONN_FAIL + 1;

	// -- ! Static members -- //

    /**
     * The activity using service
     */
	private Activity hostActivity;

	private GoogleApiClient gAPI;

	private OnConnectionListener onConnListener;

	private GoogleApiClient.ConnectionCallbacks privateOnConn = new GoogleApiClient.ConnectionCallbacks() {

		@Override
		public void onConnected(Bundle connectionHint) {

			if (onConnListener != null) onConnListener.onConn(AndroidGameService2.this, connectionHint);
		}

		@Override
		public void onConnectionSuspended(int cause) {
			AndroidGameService2.this.connect(); // Try to reconnect
		}
	};

	private GoogleApiClient.OnConnectionFailedListener privateOnConnFailed = new GoogleApiClient.OnConnectionFailedListener() {

		@Override
		public void onConnectionFailed(ConnectionResult result) {

            if (!fixConnectionFailure(hostActivity, result) && onConnListener != null) {

				onConnListener.onConnFailed(AndroidGameService2.this, result);
			}
		}
	};

    /**
     * Try to fix a connection failure from
     * {@link com.google.android.gms.common.api.GoogleApiClient.OnConnectionFailedListener#onConnectionFailed(com.google.android.gms.common.ConnectionResult)}.
     * This would start any intents to fix the problem if having solution, refer to {@link com.google.android.gms.common.ConnectionResult#startResolutionForResult(android.app.Activity, int)}.
     * The request code used for {@link com.google.android.gms.common.ConnectionResult#startResolutionForResult(android.app.Activity, int)} is {@link com.colorTapChallenge.externaLib.AndroidGameService2#CODE_REQUEST_FIX_FOR_CONN_FAIL}
     *
     * @param activity
     * 		the Activity trying to resolve the connection failure.
     * @param result
     * 		the ConnectionResult received by the Activity.
     * @return
     * 		true if there is solution and starts fixing, false otherwise.
     */
	public boolean fixConnectionFailure(Activity activity, ConnectionResult result) {

        if (result.hasResolution()) {

            try {

                result.startResolutionForResult(activity, AndroidGameService2.CODE_REQUEST_FIX_FOR_CONN_FAIL);

                return true;

            } catch (IntentSender.SendIntentException e) {
            	// The intent was canceled before it was sent.
            }
        }

        return false;
    }

    public boolean isConn() {
        return this.gAPI != null && this.gAPI.isConnected();
    }

    public void setOnConnectionListener(OnConnectionListener listener) {
        this.onConnListener = listener;
    }

    /**
     * Connect and sign in
     */
	public void connect() {
		if (this.gAPI != null && !this.gAPI.isConnected()) this.gAPI.connect();
	}

    /**
     * Disconnect and sign out
     */
	public void disconnect() {

		if (this.gAPI != null && this.gAPI.isConnected()) {

			Games.signOut(this.gAPI);

			this.gAPI.disconnect();
		}
	}

    /**
     *
     * @param leaderboard_ID
     *      The ID of leaderboard to which score is being updated
     * @param score
     *      The score to update
     * @return
     *      Refer to {@link com.google.android.gms.games.Games#Leaderboards#submitScoreImmediate}
     * @throws NoConnectionException
     */
	public PendingResult<Leaderboards.SubmitScoreResult> updateLeaderboard(String leaderboard_ID, long score) throws NoConnectionException {

		if (this.gAPI != null && !this.gAPI.isConnected()) throw new NoConnectionException();

		return Games.Leaderboards.submitScoreImmediate(this.gAPI, leaderboard_ID, score);
	}

    /**
     * Displaying leaderboard would start another activity
     *
     * @param leaderboard_ID
     *      The ID of leaderboard to display
     * @throws NoConnectionException
     */
	public void displayLeaderboard(String leaderboard_ID) throws NoConnectionException {
		
		if (this.gAPI != null && !this.gAPI.isConnected()) throw new NoConnectionException();

		this.hostActivity.startActivityForResult(Games.Leaderboards.getLeaderboardIntent(this.gAPI, leaderboard_ID), AndroidGameService2.CODE_REQUEST_LEADERBOARD);
	}
	
	// -- Interface --//
	
	public static interface OnConnectionListener {

        /**
         * Called when connecting to Android Game Service
         *
         * @param thisGameService
         * @param connectionHint
         */
		public void onConn(AndroidGameService2 thisGameService, Bundle connectionHint);

        /**
         * Called when failing on connecting to Android Game Service
         *
         * @param thisGameService
         * @param result
         */
		public void onConnFailed(AndroidGameService2 thisGameService, ConnectionResult result);
	}
	
	// -- ! Interface --//
	
	// -- Exception -- //
	
	public static class NoConnectionException extends Exception {
	}
	
	// -- ! Exception -- //
}
