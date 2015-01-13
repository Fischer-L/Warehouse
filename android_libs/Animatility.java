package android_libs;

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ValueAnimator;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.MarginLayoutParams;

class Animatility {	

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
		 
		if (paddingAnimated.equals("paddingLeft")) {
			
			paddingLeft = AnimationPaddingStart;
			
		} else if (paddingAnimated.equals("paddingRight")) {
			
			paddingRight = AnimationPaddingStart;
			 
		} else if (paddingAnimated.equals("paddingTop")) {
			
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
				 
				if (paddingAnimated.equals("paddingLeft")) {
					
					paddingLeft = padding;
					
				} else if (paddingAnimated.equals("paddingRight")) {
					
					paddingRight = padding;
					 
				} else if (paddingAnimated.equals("paddingTop")) {
					
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
	 * @param endMargin
	 * 		The margin at end of animation
	 * @return
	 * 		One Animator animating on target view's margin
	 */
	public static Animator getMarginAnimator(String marginAnimated, View v, Integer startLeftMargin, Integer startTopMargin, Integer startRightMargin, Integer startBottomMargin, int endMargin) {
		
		Integer startMargin = null;
		
		if (marginAnimated.equals("bottomMargin")) {
			
			startMargin = startBottomMargin;
			
		} else if (marginAnimated.equals("leftMargin")) {
			
			startMargin = startLeftMargin;
			 
		} else if (marginAnimated.equals("rightMargin")) {
			
			startMargin = startRightMargin;
			
		} else if (marginAnimated.equals("topMargin")) {
			
			startMargin = startTopMargin;
		}
		
		if (startMargin == null) return null;
		
		ViewGroup.MarginLayoutParams fmParams = (MarginLayoutParams) v.getLayoutParams();
		
		if (startLeftMargin != null) fmParams.leftMargin = startLeftMargin;
		if (startTopMargin != null) fmParams.topMargin = startTopMargin;
		if (startRightMargin != null) fmParams.rightMargin = startRightMargin;
		if (startBottomMargin != null) fmParams.bottomMargin = startBottomMargin;
		
		v.setLayoutParams(fmParams);
		
		return Animatility.getMarginAnimator(marginAnimated, v, startMargin, endMargin);
	}
	
	public static Animator getMarginAnimator(String marginAnimated, View v, int startMargin, int endMargin) {
		
		final View fv = v;
		final String fmarginAnimated = marginAnimated;
		final ViewGroup.MarginLayoutParams fmParams = (MarginLayoutParams) v.getLayoutParams();
		
		// Create animator
		ValueAnimator anim = ValueAnimator.ofInt(startMargin, endMargin);
		
		anim.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
			
			private View v = fv;
			
			private String marginAnimated = fmarginAnimated;
			
			private ViewGroup.MarginLayoutParams mParams = fmParams;
			
			@Override
			public void onAnimationUpdate(ValueAnimator anim) {
				
				int margin = (Integer) anim.getAnimatedValue();	
				 
				if (marginAnimated.equals("bottomMargin")) {
					
					this.mParams.bottomMargin = margin;
					
				} else if (marginAnimated.equals("leftMargin")) {
					
					this.mParams.leftMargin = margin;
					 
				} else if (marginAnimated.equals("rightMargin")) {
					
					this.mParams.rightMargin = margin;
					 
				} else {
					
					this.mParams.topMargin = margin;				 
				}
				
				this.v.setLayoutParams(this.mParams);
			}
			
		});
		 
		// Set margin to the starting value
		if (marginAnimated.equals("bottomMargin")) {
			
			fmParams.bottomMargin = startMargin;
			
		} else if (marginAnimated.equals("leftMargin")) {
			
			fmParams.leftMargin = startMargin;
			 
		} else if (marginAnimated.equals("rightMargin")) {
			
			fmParams.rightMargin = startMargin;
		} else {
			
			fmParams.topMargin = startMargin;
		}
		
		v.setLayoutParams(fmParams);
		
		return anim;
	}
	
	public static Animator getRepetitiveFlashAnimator(View v) {
		
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
