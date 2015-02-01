package android_libs;

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ValueAnimator;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.MarginLayoutParams;


/**
 * The animation utility class
 */
public class Animatility {
	
	public static final String MARGIN_LEFT = "leftMargin";	
	public static final String MARGIN_TOP = "topMargin";
	public static final String MARGIN_RIGHT = "rightMargin";
	public static final String MARGIN_BOTTOM = "bottomMargin";
	
	public static final String PADDING_LEFT = "paddingLeft";	
	public static final String PADDING_TOP = "paddingTop";
	public static final String PADDING_RIGHT = "paddingRight";
	public static final String PADDING_BOTTOM = "paddingBottom";

	public static final int DEFAULT_ANIMATION_DURATION = 800;
	
	/**
	 * Pack Animators into one AnimatorSet
	 * 
	 * @param duration
	 * 		The duration for the AnimatorSet packed up. If not greater than 0, no duration would be set on the AnimatorSet packed up
	 * @param anims
	 * 		The Animators which are being packed together
	 * @return
	 * 		The AnimatorSet packed up
	 */
	public static AnimatorSet packAnimators(Integer duration, Animator... anims) {
		
		if (anims.length <= 0) return null;
		
		AnimatorSet set = new AnimatorSet();
		AnimatorSet.Builder ab = set.play(anims[0]);
		
		for (int i = 1; i < anims.length; i++) {
			ab.with(anims[i]);
		}
		
		if (duration != null && duration > 0) set.setDuration(duration);
		
		return set;
	}
	
	/**
	 * Run Animators at the same time
	 * 
	 * @param listener
	 * 		Could be null if do not want to listen to animation
	 * @param anims
	 * 		Animators which are run together
	 */
	public static void runAnimators(Animator.AnimatorListener listener, Animator... anims) {
		
		AnimatorSet set = Animatility.packAnimators(DEFAULT_ANIMATION_DURATION, anims);
		
		if (set != null) {
			
			if (listener != null) set.addListener(listener);
			
			set.start();
		}
	}
	
	/**
	 * A reusable method generating animation on padding
	 * 
	 * @param paddingAnimated
	 * 		The Android's padding XML attribute
	 * @param v
	 * 		The view being animated
	 * @param AnimationPaddingStart
	 * 		The animation start value
	 * @param AnimationPaddingEnd
	 * 		The animation end value
	 * @return
	 * 		One Animator animating on target view's padding
	 */
	public static Animator getPaddingAnimator(String paddingAnimated, View v, int AnimationPaddingStart, int AnimationPaddingEnd) {
		 
		// It is better to set the start padding inside Animator.AnimatorListener.onAnimationStart since we do not know when the animation would starts and check input args' values.
		// However, for a quicker dev speed and right now 
		
		int paddingLeft = v.getPaddingLeft(),
			paddingRight = v.getPaddingRight(),
			paddingTop = v.getPaddingTop(),
			paddingBottom = v.getPaddingBottom();
		 
		if (paddingAnimated.equals(Animatility.PADDING_LEFT)) {
			
			paddingLeft = AnimationPaddingStart;
			
		} else if (paddingAnimated.equals(Animatility.PADDING_RIGHT)) {
			
			paddingRight = AnimationPaddingStart;
			 
		} else if (paddingAnimated.equals(Animatility.PADDING_TOP)) {
			
			paddingTop = AnimationPaddingStart;
			 
		} else {
			
			paddingBottom = AnimationPaddingStart;				 
		}		 
		v.setPadding(paddingLeft, paddingRight, paddingTop, paddingBottom);
		
		ValueAnimator anim = ValueAnimator.ofInt(AnimationPaddingStart, AnimationPaddingEnd);
		
		final View fv = v;
		final String fpa = paddingAnimated;
		
		anim.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
			
			private View v = fv;
		 	
			private String paddingAnimated = fpa;
			
			private int paddingLeft = v.getPaddingLeft(),
						paddingRight = v.getPaddingRight(),
						paddingTop = v.getPaddingTop(),
						paddingBottom = v.getPaddingBottom();

			@Override
			public void onAnimationUpdate(ValueAnimator anim) {
			
				int padding = (Integer) anim.getAnimatedValue();
				 
				if (paddingAnimated.equals(Animatility.PADDING_LEFT)) {
					
					paddingLeft = padding;
					
				} else if (paddingAnimated.equals(Animatility.PADDING_LEFT)) {
					
					paddingRight = padding;
					 
				} else if (paddingAnimated.equals(Animatility.PADDING_TOP)) {
					
					paddingTop = padding;
					 
				} else {
					
					paddingBottom = padding;				 
				}

				v.setPadding(paddingLeft, paddingRight, paddingTop, paddingBottom);
			}
		});
		
		return anim;
	 }
	
	/**
	 * A reusable method generating animation on margin
	 * 
	 * @param marginAnimated
	 * 		The margin animated
	 * @param v
	 * 		The view being animated
	 * @param startLeftMargin
	 * 		The initial left margin
	 * @param startTopMargin
	 * 		The initial top margin
	 * @param startRightMargin
	 * 		The initial right margin
	 * @param startBottomMargin
	 * 		The initial bottom margin
	 * @param margins
	 * 		The margins during animation
	 * @return
	 * 		One Animator animating on target view's margin
	 */
	public static Animator getMarginAnimator(String marginAnimated, View v, Integer startLeftMargin, Integer startTopMargin, Integer startRightMargin, Integer startBottomMargin, int... margins) {
		
		Integer startMargin = null;
		
		if (marginAnimated.equals(Animatility.MARGIN_BOTTOM)) {
			
			startMargin = startBottomMargin;
			
		} else if (marginAnimated.equals(Animatility.MARGIN_LEFT)) {
			
			startMargin = startLeftMargin;
			 
		} else if (marginAnimated.equals(Animatility.MARGIN_RIGHT)) {
			
			startMargin = startRightMargin;
			
		} else if (marginAnimated.equals(Animatility.MARGIN_TOP)) {
			
			startMargin = startTopMargin;
		}
		
		if (startMargin == null) return null;
		
		ViewGroup.MarginLayoutParams fmParams = (MarginLayoutParams) v.getLayoutParams();
		
		if (startLeftMargin != null) fmParams.leftMargin = startLeftMargin;
		if (startTopMargin != null) fmParams.topMargin = startTopMargin;
		if (startRightMargin != null) fmParams.rightMargin = startRightMargin;
		if (startBottomMargin != null) fmParams.bottomMargin = startBottomMargin;
		
		v.setLayoutParams(fmParams);
		
		return Animatility.getMarginAnimator(marginAnimated, v, margins);
	}
	
	public static Animator getMarginAnimator(String marginAnimated, View v, int... margins) {
		
		final View fv = v;
		final String fmarginAnimated = marginAnimated;
		final ViewGroup.MarginLayoutParams fmParams = (MarginLayoutParams) v.getLayoutParams();
		
		// Create animator
		ValueAnimator anim = ValueAnimator.ofInt(margins);
		
		
		anim.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
			
			private View v = fv;
			
			private String marginAnimated = fmarginAnimated;
			
			private ViewGroup.MarginLayoutParams mParams = fmParams;
			
			@Override
			public void onAnimationUpdate(ValueAnimator anim) {
				
				int margin = (Integer) anim.getAnimatedValue();	
				 
				if (marginAnimated.equals(Animatility.MARGIN_BOTTOM)) {
					
					this.mParams.bottomMargin = margin;
					
				} else if (marginAnimated.equals(Animatility.MARGIN_LEFT)) {
					
					this.mParams.leftMargin = margin;
					 
				} else if (marginAnimated.equals(Animatility.MARGIN_RIGHT)) {
					
					this.mParams.rightMargin = margin;
					 
				} else {
					
					this.mParams.topMargin = margin;				 
				}
				
				this.v.setLayoutParams(this.mParams);
			}
			
		});
		 
		// Set margin to the starting value
		if (marginAnimated.equals(Animatility.MARGIN_BOTTOM)) {
			
			fmParams.bottomMargin = margins[0];
			
		} else if (marginAnimated.equals(Animatility.MARGIN_LEFT)) {
			
			fmParams.leftMargin = margins[0];
			 
		} else if (marginAnimated.equals(Animatility.MARGIN_RIGHT)) {
			
			fmParams.rightMargin = margins[0];
		} else {
			
			fmParams.topMargin = margins[0];
		}
		
		v.setLayoutParams(fmParams);
		
		return anim;
	}
	
	public static Animator getRepeativeFlashAnimator(View v) {
		
		v.setAlpha(1);
		
		Keyframe kf0 = Keyframe.ofFloat(0.0f, 1.0f);
		Keyframe kf1 = Keyframe.ofFloat(0.8f, 1.0f);
		Keyframe kf2 = Keyframe.ofFloat(0.9f, 0.0f);
		Keyframe kf3 = Keyframe.ofFloat(1.0f, 0.0f);		
		PropertyValuesHolder alphaKeyFrames = PropertyValuesHolder.ofKeyframe("alpha", kf0, kf1, kf2, kf3);		
		
		ObjectAnimator anim = ObjectAnimator.ofPropertyValuesHolder(v, alphaKeyFrames);
		anim.setDuration(2000);
		anim.setRepeatCount(Animation.INFINITE);
		
		return anim;
	}
}
