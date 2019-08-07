import { injectable } from "inversify";
import ResizeObserver from "resize-observer-polyfill";
import { ScrollableIndicatorsAxis } from "./scrollableIndicatorsAxis";

// TODO consider using a media query to avoid executing logic when pointer is fine (scrollbar is visible and indicators are hidden)
// TODO what if there is only 1 element in scrollable element?
// TODO what if we want to toggle first/last visible elements? e.g if elements in scrollable element are hidden on some event.
@injectable()
export default class ScrollableIndicators {
    private static readonly INDICATOR_ACTIVE_CLASS = 'scrollable-indicators__indicator--active';

    private _intersectionObserver: IntersectionObserver;
    private _intersectionObserverObserving: boolean = false;

    private _startIndicatorElementClassList: DOMTokenList;
    private _endIndicatorElementClassList: DOMTokenList;
    private _firstVisibleElement: HTMLElement;
    private _lastVisibleElement: HTMLElement;
    private _scrollableElement: HTMLElement;

    public constructor(private _rootElement: HTMLElement,
        private _scrollableIndicatorsAxis: ScrollableIndicatorsAxis) {

        if (_scrollableIndicatorsAxis === ScrollableIndicatorsAxis.horizontal) {
            this._startIndicatorElementClassList = _rootElement.querySelector('.scrollable-indicators__indicator--horizontal-start').classList;
            this._endIndicatorElementClassList = _rootElement.querySelector('.scrollable-indicators__indicator--horizontal-end').classList;
        } else {
            this._startIndicatorElementClassList = _rootElement.querySelector('.scrollable-indicators__indicator--vertical-start').classList;
            this._endIndicatorElementClassList = _rootElement.querySelector('.scrollable-indicators__indicator--vertical-end').classList;
        }

        // Scrollable element
        this._scrollableElement = this._rootElement.children[0] as HTMLElement;
        if (!this._scrollableElement || this._scrollableElement.children.length === 0) {
            // No scrollable element or it exists but has no children
            return;
        }

        // First and last visible elements
        // TODO could be more robust. What if scrollableElement has only 1 direct child but many descendants?
        this._firstVisibleElement = this._scrollableElement.firstElementChild as HTMLElement;
        this._lastVisibleElement = this._scrollableElement.lastElementChild as HTMLElement;

        // Resize observer
        let resizeObserver = new ResizeObserver(this.onResizeListener);
        resizeObserver.observe(this._scrollableElement);

        // Intersection observer
        this._intersectionObserver = new IntersectionObserver(this.onIntersectionListener, { root: _rootElement, threshold: 1 });
    }

    private observe() {
        this._intersectionObserverObserving = true;
        this._intersectionObserver.observe(this._firstVisibleElement);
        this._intersectionObserver.observe(this._lastVisibleElement);
    }

    private unobserve() {
        this._intersectionObserverObserving = false;
        this._intersectionObserver.disconnect();
    }

    // TODO this is necessary because intersection observer doesn't work properly when root element has no overflow. 
    // 
    // Issues with intersection observer occured in chrome. intersectionRatio was sometimes less than 1 despite root element having no overflow.
    // rootbounds had rounded values (left, width, etc), but target bounding client rect did not. So target sometimes "exceeded" root by 0.x pixels,
    // causing the < 1 intersectionRatio.
    private onResizeListener = (_: ResizeObserverEntry[]) => {
        let scrollable = (this._scrollableIndicatorsAxis === ScrollableIndicatorsAxis.horizontal && this._scrollableElement.scrollWidth > this._scrollableElement.clientWidth) ||
            (this._scrollableIndicatorsAxis === ScrollableIndicatorsAxis.vertical && this._scrollableElement.scrollHeight > this._scrollableElement.clientHeight);

        if (scrollable && !this._intersectionObserverObserving) {
            this.observe();
        } else if (!scrollable && this._intersectionObserverObserving) {
            this.unobserve();
            this._startIndicatorElementClassList.remove(ScrollableIndicators.INDICATOR_ACTIVE_CLASS);
            this._endIndicatorElementClassList.remove(ScrollableIndicators.INDICATOR_ACTIVE_CLASS);
        }
    }

    private onIntersectionListener = (entries: IntersectionObserverEntry[], _: IntersectionObserver) => {
        for (let i = 0; i < entries.length; i++) {
            let entry = entries[i];

            if (entry.target === this._firstVisibleElement) {
                if (entry.intersectionRatio < 1) {
                    this._startIndicatorElementClassList.add(ScrollableIndicators.INDICATOR_ACTIVE_CLASS);
                } else {
                    this._startIndicatorElementClassList.remove(ScrollableIndicators.INDICATOR_ACTIVE_CLASS);
                }
            } else if (entry.target === this._lastVisibleElement) {
                if (entry.intersectionRatio < 1) {
                    this._endIndicatorElementClassList.add(ScrollableIndicators.INDICATOR_ACTIVE_CLASS);
                } else {
                    this._endIndicatorElementClassList.remove(ScrollableIndicators.INDICATOR_ACTIVE_CLASS);
                }
            }
        }
    }
}
