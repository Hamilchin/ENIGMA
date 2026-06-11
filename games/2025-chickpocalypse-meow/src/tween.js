 const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

 class Tween {
     constructor(target, property, startValue, endValue, duration, easingFunction = null, onComplete = null) {
         this.target = target;
         this.property = property;
         this.startValue = startValue;
         this.endValue = endValue;
         this.duration = duration;
         this.easingFunction = easingFunction || ((t) => t);
         this.onComplete = onComplete;
         this.currentTime = 0;
         this.isComplete = false;
     }

     update(deltaTime) {
         if (this.isComplete) return;

         this.currentTime += deltaTime;
         const progress = Math.min(this.currentTime / this.duration, 1);
         const easedProgress = this.easingFunction(progress);

         const currentValue = this.startValue + (this.endValue - this.startValue) * easedProgress;
         this.target[this.property] = currentValue;

         if (progress >= 1) {
             this.isComplete = true;
             if (this.onComplete) this.onComplete();
         }
     }
 }