import { injectable, inject } from "inversify";
//import EasingService from "./easingService";

@injectable()
export default class Dropdown {
    private _contentOuterWrapperElement: HTMLElement;
    private _contentInnerWrapperElement: HTMLElement;
    private _toggleElement: HTMLElement;
    private _headerAndContentWrapperElement: HTMLElement;

    public constructor(
        contentOuterWrapperElement: HTMLElement,
        contentInnerWrapperElement: HTMLElement,
        toggleElement: HTMLElement,
        headerAndContentWrapperElement: HTMLElement) {

        this._contentOuterWrapperElement = contentOuterWrapperElement;
        this._contentInnerWrapperElement = contentInnerWrapperElement;
        this._toggleElement = toggleElement;
        this._headerAndContentWrapperElement = headerAndContentWrapperElement;
    }

    public toggleWithAnimation() {
        if (this._toggleElement.classList.contains('expanded')) {
            this.collapseWithAnimation();
        } else {
            this.expandWithAnimation();
        }
    }

    public expandWithAnimation() {
        if (this._headerAndContentWrapperElement) {
            this._headerAndContentWrapperElement.style.transition = '';
            let headerAndContentWrapperInitialTop = this._headerAndContentWrapperElement.getBoundingClientRect().top;
            this._headerAndContentWrapperElement.style.transform = `translateY(${-headerAndContentWrapperInitialTop}px)`;
        }

        this._contentOuterWrapperElement.style.animationName = 'expandAnimation';
        this._contentInnerWrapperElement.style.animationName = 'expandInverseAnimation';

        this._toggleElement.classList.add('expanded');
    }

    public collapseWithAnimation() {
        if (this._headerAndContentWrapperElement) {
            this._headerAndContentWrapperElement.style.transition = '';
            this._headerAndContentWrapperElement.style.transform = 'translateY(0)';
        }

        this._contentOuterWrapperElement.style.animationName = 'collapseAnimation';
        this._contentInnerWrapperElement.style.animationName = 'collapseInverseAnimation';

        this._toggleElement.classList.remove('expanded');
    }

    public toggleWithoutAnimation() {
        if (this._toggleElement.classList.contains('expanded')) {
            this.collapseWithoutAnimation();
        } else {
            this.expandWithoutAnimation();
        }
    }

    public expandWithoutAnimation() {
        if (this._headerAndContentWrapperElement) {
            this._headerAndContentWrapperElement.style.transition = 'initial';
            let headerAndContentWrapperInitialTop = this._headerAndContentWrapperElement.getBoundingClientRect().top;
            this._headerAndContentWrapperElement.style.transform = `translateY(${-headerAndContentWrapperInitialTop}px)`;
        }

        this._contentOuterWrapperElement.style.animationName = '';
        this._contentInnerWrapperElement.style.animationName = '';

        this._contentOuterWrapperElement.style.transform = 'scaleY(1)';
        this._contentInnerWrapperElement.style.transform = 'scaleY(1)';

        this._toggleElement.classList.add('expanded');
    }

    public collapseWithoutAnimation() {
        if (this._headerAndContentWrapperElement) {
            this._headerAndContentWrapperElement.style.transition = 'initial';
            this._headerAndContentWrapperElement.style.transform = 'translateY(0)';
        }

        this._contentOuterWrapperElement.style.animationName = '';
        this._contentInnerWrapperElement.style.animationName = '';

        this._toggleElement.classList.remove('expanded');
    }

    public reset() {
        if (this._headerAndContentWrapperElement) {
            this._headerAndContentWrapperElement.style.transition = '';
            this._headerAndContentWrapperElement.style.transform = '';
        }

        this._contentOuterWrapperElement.style.transform = '';
        this._contentInnerWrapperElement.style.transform = '';
        this._contentOuterWrapperElement.style.animationName = '';
        this._contentInnerWrapperElement.style.animationName = '';


        this._toggleElement.classList.remove('expanded');
    }

    public isExpanded() {
        // Could have a private boolean for expanded/collapsed state, however, elements can be modified by other scripts, 
        // this seems like the lesser evil.
        return this._toggleElement.classList.contains('expanded');
    }

    // TODO ended up pre-creating animations for dropdowns (see _dropdown.scss), this logic may still be useful though, find somewhere to store it.
    // https://developers.google.com/web/updates/2017/03/performant-expand-and-collapse#step_2_build_css_animations_on_the_fly
    //private createScaleYKeyFrameAnimations(numSteps: number) {
    //    let expandAnimation = '';
    //    let expandInverseAnimation = '';
    //    let collapseAnimation = '';
    //    let collapseInverseAnimation = '';

    //    for (let step = 0; step <= numSteps; step++) {
    //        let percentage = step / numSteps * 100;

    //        let expandEasingValue = this._easingService.getEaseOutQuadEasingValue(step / numSteps);
    //        expandAnimation += `${percentage}% {
    //          transform: scaleY(${expandEasingValue});
    //        }`;

    //        // Arbitrary small value to avoid divide by 0 (does not matter since in first frame, animation scale y is 0, so element is completely hidden)
    //        let expandInvertedEasingValue = 1 / (expandEasingValue === 0 ? 0.01 : expandEasingValue);
    //        expandInverseAnimation += `${percentage}% {
    //          transform: scaleY(${expandInvertedEasingValue});
    //        }`;

    //        let collapseEasingVlaue = 1 - expandEasingValue;
    //        collapseAnimation += `${percentage}% {
    //          transform: scaleY(${collapseEasingVlaue});
    //        }`;

    //        let collapseInvertedEasingVlaue = 1 / (collapseEasingVlaue === 0 ? 0.01 : collapseEasingVlaue);
    //        collapseInverseAnimation += `${percentage}% {
    //          transform: scaleY(${collapseInvertedEasingVlaue});
    //        }`;
    //    }

    //    return `@keyframes expandAnimation {
    //        ${expandAnimation}
    //      }

    //      @keyframes expandInverseAnimation {
    //        ${expandInverseAnimation}
    //      }

    //      @keyframes collapseAnimation {
    //        ${collapseAnimation}
    //      }

    //      @keyframes collapseInverseAnimation {
    //        ${collapseInverseAnimation}
    //      }`;
    //}
}
