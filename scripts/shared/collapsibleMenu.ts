import * as SmoothScroll from 'smooth-scroll';
import StringService from './stringService';
import TransitionService from './transitionService';

export default class CollapsibleMenu {
    private _stringService: StringService;
    private _transitionService: TransitionService;
    private _rootElement: HTMLElement;
    private _rootLIElements: NodeList;

    public constructor(
        rootElement: HTMLElement,
        rootLIElements: NodeList,
        stringService: StringService,
        transitionService: TransitionService) {

        this._stringService = stringService;
        this._transitionService = transitionService;
        this._rootElement = rootElement;
        this._rootLIElements = rootLIElements;
    }

    public filter(filterValue: string = null): void {
        for (let i = 0; i < this._rootLIElements.length; i++) {
            let rootLIElement = this._rootLIElements[i] as HTMLLIElement;

            this.setLIElementFilteredState(rootLIElement, filterValue);
            this.setFilteredLIElementHeight(rootLIElement, true);
        }
    }

    // An LI element can have three possible states, filter-expanded, filter-match and filter-hidden. filter-hidden is mutually exclusive from the other
    // two states, also an element can have the filter-match state but not the filter-expanded state. An LI element has the filter-match state if its 
    // contents contain the filter value. It has the filter-expanded state if any of its children has the filter-match or filter-expanded states.
    // Lastly, it has the filter-hidden state if it does not have either of the filter-match or filter-expanded states.
    //
    // Since LI elements are organized as a tree and the states of children are required to determine the states of parents, this state setting function 
    // performs a depth first search in post-order.
    private setLIElementFilteredState(liElement: HTMLLIElement, filterValue: string = null): void {
        // Reset
        this.resetLIElementState(liElement);

        let directChildULElement = liElement.querySelector('ul');
        let toBeExpanded: boolean = false;

        // Skip leaves
        if (directChildULElement) {
            let closestChildLIElements = directChildULElement.children;

            for (let i = 0; i < closestChildLIElements.length; i++) {
                let childLIElement = closestChildLIElements[i] as HTMLLIElement;
                this.setLIElementFilteredState(childLIElement, filterValue);

                if (!toBeExpanded && !childLIElement.classList.contains('filter-hidden')) {
                    toBeExpanded = true;
                    liElement.classList.add('filter-expanded');
                }
            }
        }

        // Check if text matches
        let displayedElement = liElement.querySelector('span, a');
        let displayedText = displayedElement.textContent;
        let matches = this._stringService.contains(displayedText, filterValue);

        if (matches) {
            liElement.classList.add('filter-match');
        } else if (!toBeExpanded) {
            // Does not match and has no children that match
            liElement.classList.add('filter-hidden');
        }
    }

    // Called after setLIElementFilteredState. setLIElementFilteredState sets some elements to "display: none" through the filter-hidden class.
    // It is necessary to process the entire tree before toggling heights, since the final height of each element must be known.
    private setFilteredLIElementHeight = (liElement: HTMLLIElement, allParentsAlreadyExpanded: boolean): void => {
        let directChildULElement = liElement.querySelector('ul');

        // Leaves don't need their heights toggled
        if (directChildULElement) {
            let alreadyExpanded = liElement.classList.contains('expanded');
            let toBeExpanded = liElement.classList.contains('filter-expanded');
            let closestChildLIElements = directChildULElement.children;

            for (let i = 0; i < closestChildLIElements.length; i++) {
                this.setFilteredLIElementHeight(closestChildLIElements[i] as HTMLLIElement, allParentsAlreadyExpanded && alreadyExpanded);
            }

            if (toBeExpanded && !alreadyExpanded) {
                if (allParentsAlreadyExpanded) {
                    this._transitionService.toggleHeightWithTransition(directChildULElement, liElement);
                } else {
                    this._transitionService.toggleHeightWithoutTransition(directChildULElement, liElement);
                }
            } else if (!toBeExpanded && alreadyExpanded) {
                this._transitionService.toggleHeightWithTransition(directChildULElement, liElement);
            }
        }
    }

    public restorePreFilterState(): void {
        if (this._rootElement.classList.contains('filtered')) {
            for (let i = 0; i < this._rootLIElements.length; i++) {
                this.restoreLIElementPreFilterState(this._rootLIElements[i] as HTMLLIElement, true);
            }

            this._rootElement.classList.remove('filtered');
        }
    }

    // Restore collapsable menu to inital state. Depth first search in post-order since child elements must be assigned their height values
    // before animations are started for parent elements (parent elements need to know how much to grow).
    private restoreLIElementPreFilterState(liElement: HTMLLIElement, allParentsAlreadyExpanded: boolean): void {
        // Reset
        this.resetLIElementState(liElement);

        let directChildULElement = liElement.querySelector('ul');

        // Leaves don't need their heights toggled
        if (directChildULElement) {
            let alreadyExpanded = liElement.classList.contains('expanded');
            let preExpanded = liElement.classList.contains('pre-expanded');
            let closestChildLIElements = directChildULElement.children;

            liElement.classList.remove('pre-expanded')

            for (let i = 0; i < closestChildLIElements.length; i++) {
                this.restoreLIElementPreFilterState(closestChildLIElements[i] as HTMLLIElement, allParentsAlreadyExpanded && alreadyExpanded);
            }

            if (preExpanded && !alreadyExpanded) {
                if (allParentsAlreadyExpanded) {
                    this._transitionService.toggleHeightWithTransition(directChildULElement, liElement);
                } else {
                    this._transitionService.toggleHeightWithoutTransition(directChildULElement, liElement);
                }
            }
            else if (!preExpanded && alreadyExpanded) {
                this._transitionService.toggleHeightWithTransition(directChildULElement, liElement);
            }
        }
    }

    public savePreFilterState(): void {
        let preExpandedLIs = this.
            _rootElement.
            querySelectorAll('.expanded');

        for (let i = 0; i < preExpandedLIs.length; i++) {
            preExpandedLIs[i].classList.add('pre-expanded');
        }
    }

    private resetLIElementState(liElement: HTMLLIElement): void {
        liElement.classList.remove('filter-hidden', 'filter-expanded', 'filter-match');
    }
}