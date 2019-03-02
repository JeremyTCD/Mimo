import { named, injectable, inject } from 'inversify';
import MediaGlobalService from './mediaGlobalService';
import GlobalService from './globalService';
import { MediaWidth } from './mediaWidth';
var SmoothScroll = require('./smoothScroll');

interface ObservedSectionData {
    element: HTMLElement;
    isVisible: boolean;
    level: number;
    prevNonSectionElement: HTMLElement; // We need this so that the active section can be a level n section until its first level n+1 child section is reached
    prevIsVisible: boolean;
}

@injectable()
export default class ArticleGlobalService implements GlobalService {
    private _onlyOneSection: boolean;
    private _sectionElements: HTMLElement[];
    private _observedSectionDatas: ObservedSectionData[] = [];
    private _sectionHashes: string[] = []; // For updating location.hash (updates url in search bar)
    private _activeSectionIndexFixed: boolean;
    private _activeSectionChangedListeners: ((newIndex: number) => void)[] = [];
    private _activeSectionIndex: number = 0;
    private _narrowIntersectionObserver: IntersectionObserver; // There is a permanent header when mode is narrow, so root margin must be set
    private _mediumWideIntersectionObserver: IntersectionObserver;
    private _smoothScrollOffset: number = 0; // If onlyOneSection is true, _smoothScrollOffset is still used by tryGetActiveSectionIndexFromHash
    private _headerEnabled: boolean;
    private _narrowInterSectionListenerCorrected: boolean;
    private _level2SectionSmoothScrollOffset: number;

    public constructor(
        @inject('GlobalService') @named('MediaGlobalService') private _mediaGlobalService: MediaGlobalService) {
    }

    public setupOnDomContentLoaded(): void {
        // Do nothing
    }

    public setupImmediate(): void {
        // Check if article menu header is enabled
        this._headerEnabled = !!document.querySelector('.article-menu');

        // Smooth scroll
        SmoothScroll('a[href*="#"]', {
            speed: 150,
            speedAsDuration: true,
            offset: (anchor: HTMLElement, _: HTMLElement) => {
                if (!this._mediaGlobalService.mediaWidthIs(MediaWidth.narrow)) {
                    return 0;
                }
                return anchor.classList.contains('flexi-section-block-2') ? this._level2SectionSmoothScrollOffset : this._smoothScrollOffset;
            }
        });

        // Setup section datas for observation
        this._sectionElements = Array.from<HTMLElement>(document.querySelectorAll('.main-article, .main-article > .flexi-section-block-2, .main-article > .flexi-section-block-2 > .flexi-section-block-3')); // Ignore sections in subtrees

        this._onlyOneSection = this._sectionElements.length === 1; // Only article
        if (this._onlyOneSection) {
            return;
        }

        this._sectionElements.forEach((sectionElement: Element, index: number) => {
            let level: number = 3;
            if (sectionElement.classList.contains('main-article')) {
                level = 1;
            }
            else if (sectionElement.classList.contains('flexi-section-block-2')) {
                level = 2;
            }

            this._observedSectionDatas.push({
                isVisible: false,
                element: sectionElement as HTMLElement,
                level: level,
                prevNonSectionElement: sectionElement.previousElementSibling && sectionElement.previousElementSibling.tagName != 'SECTION' ? sectionElement.previousElementSibling as HTMLElement : null,
                prevIsVisible: false
            });

            // Set section hashes
            this._sectionHashes[index] = `#${sectionElement.id}`;
        });
    }

    public setupOnLoad(): void {
        if (this._onlyOneSection) {
            return;
        }

        this._mediaGlobalService.addChangedToListener(this.onChangedToNarrowListener, MediaWidth.narrow)
        this._mediaGlobalService.addChangedFromListener(this.onChangedFromNarrowListener, MediaWidth.narrow);

        // Custom smooth-scroll events
        document.addEventListener('scrollStart', this.smoothScrollBefore, false);
        document.addEventListener('scrollStop', this.smoothScrollAfter, false);

        // Set initial _activeSectionIndex
        let activeSectionIndex = this.tryGetActiveSectionIndexFromHash();
        if (activeSectionIndex > -1) {
            this.setActiveSectionIndex(activeSectionIndex);
        }
    }

    private onChangedToNarrowListener = (): void => {
        if (this._mediumWideIntersectionObserver) {
            this._mediumWideIntersectionObserver.disconnect();
        }

        this._smoothScrollOffset = this._headerEnabled ? 37 : 0;
        this._level2SectionSmoothScrollOffset = this._headerEnabled ? 18 : -19; // Limit top gap on mobiles

        // Create and register intersection observer
        if (!this._narrowIntersectionObserver) {
            this._narrowIntersectionObserver = this.createNarrowIntersectionObserver();
            this._narrowInterSectionListenerCorrected = false;
        }
        this.observeSections(this._narrowIntersectionObserver);
    }

    private createNarrowIntersectionObserver = (multiplyByDevicePixelRatio: boolean = false): IntersectionObserver => {
        let topMargin = -this._smoothScrollOffset;
        if (multiplyByDevicePixelRatio) {
            topMargin *= window.devicePixelRatio;
        }

        return new IntersectionObserver(this.onIntersectionListener, { threshold: 0, rootMargin: `${topMargin}px 0px 0px 0px` });
    }

    private onChangedFromNarrowListener = (): void => {
        if (this._narrowIntersectionObserver) {
            this._narrowIntersectionObserver.disconnect();
        }

        this._level2SectionSmoothScrollOffset = this._smoothScrollOffset = 0;

        // Create and register intersection observer
        if (!this._mediumWideIntersectionObserver) {
            this._mediumWideIntersectionObserver = new IntersectionObserver(this.onIntersectionListener, { threshold: 0 });
        }
        this.observeSections(this._mediumWideIntersectionObserver);
    }

    private observeSections = (intersectionObserver: IntersectionObserver): void => {
        for (let i = 0; i < this._observedSectionDatas.length; i++) {
            let observedSectionData = this._observedSectionDatas[i];

            if (observedSectionData.prevNonSectionElement) {
                intersectionObserver.observe(observedSectionData.prevNonSectionElement);
            }
            intersectionObserver.observe(observedSectionData.element);
        }
    }

    private onIntersectionListener = (entries: IntersectionObserverEntry[], _: IntersectionObserver) => {
        // On Chrome for Android, rootMargins are read as device pixels (as opposed to CSS pixels > window.devicePixelRatio = devicePixels/cssPixels). 
        // To verify whether or not we are dealing with Chrome for Android, we check whether the computed rootBounds.top is equal to what we requested, _headerHeight.
        // If it isn't, we ditch the initial _narrowIntersectionObserver and create a new one with rootMargins multiplied by window.devicePixelRatio.
        if (!this._narrowInterSectionListenerCorrected && // Only correct once. Why? Chrome for Android computes rootBounds.top as ourSpecifiedRootMarginTop/window.devicePixelRatio. Even
            // if we specify ourSpecifiedRootMarginTop as _smoothScrollOffset * window.devicePixelRatio, rootBounds.top may not === _smoothScrollOffset
            // due to the accuracy limitations of floating point calculations.
            this._smoothScrollOffset !== 0 && // If offset is 0, nothing to correct
            this._mediaGlobalService.mediaWidthIs(MediaWidth.narrow) && // In medium and wide mode, rootBounds.top is always 0
            entries[0].rootBounds.top !== this._smoothScrollOffset) {
            this._narrowInterSectionListenerCorrected = true;
            this._narrowIntersectionObserver.disconnect();
            this._narrowIntersectionObserver = this.createNarrowIntersectionObserver(true);
            this.observeSections(this._narrowIntersectionObserver);

            return;
        }

        // Update observed elements isVisible
        for (let i = 0; i < entries.length; i++) {
            let entry = entries[i];

            this._observedSectionDatas.some((observedSectionData: ObservedSectionData) => {
                // Since threshold is 0, if callback has fired for element, isIntersecting == isVisible.
                if (observedSectionData.element === entry.target) {
                    observedSectionData.isVisible = entry.isIntersecting;

                    return true;
                }
                else if (observedSectionData.prevNonSectionElement === entry.target) {
                    observedSectionData.prevIsVisible = entry.isIntersecting;

                    return true;
                }

                return false;
            });
        }

        // Don't update active section index if it is fixed
        if (this._activeSectionIndexFixed) {
            return;
        }

        // Get index of first visible section index
        let activeSectionIndex = this._observedSectionDatas.findIndex((observedSectionData: ObservedSectionData, index: number) => {
            if (observedSectionData.isVisible) {
                let nextObservedSectionData: ObservedSectionData;

                if (observedSectionData.level == 3 || // Highest level
                    index == this._observedSectionDatas.length - 1 || // Section is the last observed section
                    (nextObservedSectionData = this._observedSectionDatas[index + 1]).level <= observedSectionData.level || // Next observed section has lower or equal level
                    nextObservedSectionData.prevIsVisible) { // Next observed section isn't the active section yet
                    return true;
                }
            }

            return false;
        });

        if (activeSectionIndex === -1) { // No sections visible yet (could happen if viewport height is small)
            activeSectionIndex = 0;
        }

        if (this.setActiveSectionIndex(activeSectionIndex)) {
            this.updateHistory();
        }
    }

    public addActiveSectionChangedListener(listener: (newIndex: number) => void, init: boolean = false) {
        if (this._onlyOneSection) {
            return;
        }

        this._activeSectionChangedListeners.push(listener);

        if (init) {
            listener(this._activeSectionIndex);
        }
    }

    public removeActiveSectionChangedListener(listener: (newIndex: number) => void) {
        if (this._onlyOneSection) {
            return;
        }

        let index = this._activeSectionChangedListeners.indexOf(listener);

        if (index > -1) {
            this._activeSectionChangedListeners.splice(index, 1);
        }
    }

    public getActiveSectionIndex(): number {
        return this._activeSectionIndex;
    }

    public getSectionElements(): HTMLElement[] {
        return this._sectionElements;
    }

    private tryGetActiveSectionIndexFromHash(): number {
        let hash = location.hash;

        // # or #top navigate to the top of the page - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href.
        // Smooth-scroll used to add a #smooth-scroll-top id to body to scroll to the top, it no longer does that, instead
        // it just scrolls to # or #top - https://github.com/cferdinandi/smooth-scroll/commit/37f579b05f6173bba300777867f6b8b613339662#diff-2fa6e0fecc1866964986277037867a1cR468.
        if (!hash || hash === '#top' || hash === '#') {
            return 0;
        }

        let bodyHeight = document.body.getBoundingClientRect().height; // May change so we have to retrieve it each time
        for (let i = 0; i < this._sectionHashes.length; i++) {
            if (hash === this._sectionHashes[i]) {
                // Ensure that section can be scrolled to
                while (bodyHeight - this._observedSectionDatas[i].element.offsetTop < window.innerHeight - this._smoothScrollOffset) { // offsetTop may change, so it can't be cached
                    if (i === 0) { // If we get to 0, it means that even the first section can't be scrolled to
                        break;
                    }
                    i--;
                }

                return i;
            }
        }

        return -1;
    }

    private setActiveSectionIndex(newIndex: number): boolean {
        if (newIndex === this._activeSectionIndex) {
            return false;
        }

        this._activeSectionIndex = newIndex;

        for (let i = 0; i < this._activeSectionChangedListeners.length; i++) {
            this._activeSectionChangedListeners[i](newIndex);
        }

        return true;
    }

    // Chrome and edge have rendering issues if activeHeaderIndex changes rapidly and knob translate/scale are updated rapidly.
    // Fixing activeHeaderIndex on smooth-scroll avoids these rendering issues.
    private smoothScrollBefore = (): void => {
        this._activeSectionIndexFixed = true;
        let endActiveSectionIndex = this.tryGetActiveSectionIndexFromHash();

        if (endActiveSectionIndex > -1) {
            this.setActiveSectionIndex(endActiveSectionIndex);
        } else {
            // Not navigating to top or an article section (could be a link in the article to another element in the article)
            this._activeSectionIndexFixed = false;
        }
    }

    private smoothScrollAfter = (): void => {
        // Note: scroll listener fires one last time after smoothScrollAfter is called
        this._activeSectionIndexFixed = false;
    }

    private updateHistory = (): void => {
        let url = this._activeSectionIndex == 0 ? location.pathname : this._sectionHashes[this._activeSectionIndex];

        if (url === location.hash) {
            return;
        }

        history.replaceState(null, null, url);
    }
}
