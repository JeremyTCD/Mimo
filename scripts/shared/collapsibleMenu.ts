import StringService from './stringService';
import HeightService from './heightService';

export default class CollapsibleMenu {
    private static readonly FILTERED_CLASS: string = 'collapsible-menu--filtered';
    private static readonly LI_FILTER_MATCH_CLASS: string = 'collapsible-menu__node--filter-match';
    private static readonly LI_FILTER_EXPANDED_CLASS: string = 'collapsible-menu__node--filter-expanded';
    private static readonly LI_FILTER_HIDDEN_CLASS: string = 'collapsible-menu__node--filter-hidden';
    private static readonly LI_EXPANDED_CLASS: string = 'collapsible-menu__node--expanded';
    private static readonly LI_PRE_EXPANDED_CLASS: string = 'collapsible-menu__node--pre-expanded';

    private _rootElementClassList: DOMTokenList;
    private _rootULElement: HTMLUListElement;

    public constructor(
        private _rootElement: HTMLElement,
        private _stringService: StringService,
        private _heightService: HeightService) {

        this.registerExpandButtonsClickListener(this._rootElement);
        this._rootULElement = _rootElement.querySelector('ul');
        this._rootElementClassList = _rootElement.classList;
    }

    public filter(filterValue: string = null): void {
        if (!this._rootElementClassList.contains(CollapsibleMenu.FILTERED_CLASS)) {
            this.savePreFilterState();
            this._rootElementClassList.add(CollapsibleMenu.FILTERED_CLASS);
        }

        this.setLIElementsFilterState(this._rootULElement, false, filterValue);
        this.setFilteredLIElementsHeight(this._rootULElement, true);
    }

    public restorePreFilterState(): void {
        if (this._rootElementClassList.contains(CollapsibleMenu.FILTERED_CLASS)) {
            this.restoreLIElementsPreFilterStateAndHeight(this._rootULElement, true);
            this._rootElementClassList.remove(CollapsibleMenu.FILTERED_CLASS);
        }
    }

    // An LI element can have three possible states, filter-expanded, filter-match and filter-hidden. filter-hidden is mutually exclusive from the other
    // two states. Also, an element can have the filter-match state but not the filter-expanded state. An LI element has the filter-match state if its 
    // contents contain the filter value. It has the filter-expanded state if any of its children has the filter-match or filter-expanded states.
    // Lastly, it has the filter-hidden state if it does not have either of the filter-match or filter-expanded states.
    //
    // Since LI elements are organized as a tree and the states of children are required to determine the states of parents, this state setting function 
    // performs a depth first search in post-order.
    private setLIElementsFilterState(ulElement: HTMLUListElement, parentMatches: boolean, filterValue: string = null): boolean {
        let anyMatch = false;
        let childLIElements = ulElement.children;
        for (let i = 0; i < childLIElements.length; i++) {
            let childLIElement = childLIElements[i] as HTMLLIElement;
            let childLIElementClassList = childLIElement.classList;

            // Reset
            this.resetLIElementFilterState(childLIElementClassList);

            // Check if text matches
            let topicElement = childLIElement.querySelector('span, a');
            let topic = topicElement.textContent;
            let matches = this._stringService.contains(topic, filterValue);

            let childULElement = childLIElement.querySelector('ul');
            let childUlElementAnyMatch = false;

            if (childULElement) {
                childUlElementAnyMatch = this.setLIElementsFilterState(childULElement, matches || parentMatches, filterValue);
            }

            // If any of this LIElement's descendants matches, this LIElement must be expanded
            if (childUlElementAnyMatch) {
                childLIElementClassList.add(CollapsibleMenu.LI_FILTER_EXPANDED_CLASS);
            }

            if (matches) {
                childLIElementClassList.add(CollapsibleMenu.LI_FILTER_MATCH_CLASS);
                anyMatch = true;
            } else if (!childUlElementAnyMatch && !parentMatches) {
                // Does not match and has no descendants that match
                childLIElementClassList.add(CollapsibleMenu.LI_FILTER_HIDDEN_CLASS);
            }

            anyMatch = anyMatch || childUlElementAnyMatch;
        }

        return anyMatch;
    }

    // Called after setLIElementFilteredState. setLIElementFilteredState sets some elements to "display: none" through the filter-hidden class.
    // It is necessary to process the entire tree before toggling heights, since the final height of each element must be known.
    private setFilteredLIElementsHeight = (ulElement: HTMLUListElement, allParentsAlreadyExpanded: boolean): void => {
        let childLIElements = ulElement.children;
        for (let i = 0; i < childLIElements.length; i++) {
            let childLIElement = childLIElements[i] as HTMLLIElement;
            let childULElement = childLIElement.querySelector('ul');

            // Leaves don't need their heights toggled
            if (childULElement) {
                let childLIElementClassList = childLIElement.classList;
                let alreadyExpanded = childLIElementClassList.contains(CollapsibleMenu.LI_EXPANDED_CLASS);
                let toExpand = childLIElementClassList.contains(CollapsibleMenu.LI_FILTER_EXPANDED_CLASS);

                this.setFilteredLIElementsHeight(childULElement, allParentsAlreadyExpanded && alreadyExpanded);

                if (toExpand && !alreadyExpanded) {
                    if (allParentsAlreadyExpanded) {
                        this._heightService.toggleHeightWithTransition(childULElement, childLIElement, CollapsibleMenu.LI_EXPANDED_CLASS);
                    } else {
                        this._heightService.toggleHeightWithoutTransition(childULElement, childLIElement, CollapsibleMenu.LI_EXPANDED_CLASS);
                    }
                } else if (!toExpand && alreadyExpanded) {
                    this._heightService.toggleHeightWithTransition(childULElement, childLIElement, CollapsibleMenu.LI_EXPANDED_CLASS);
                }
            }
        }
    }

    private registerExpandButtonsClickListener(rootElement: HTMLElement): void {
        let buttonElements = rootElement.querySelectorAll('.collapsible-menu__button');

        for (let i = 0; i < buttonElements.length; i++) {
            let buttonElement = buttonElements[i] as HTMLElement;

            buttonElement.addEventListener('click', this.expandButtonClickListener);
        }
    }

    private expandButtonClickListener = (event: Event) => {
        let parentLIElement = (event.currentTarget as HTMLButtonElement).parentElement.parentElement;
        let childUlElement = parentLIElement.querySelector('ul');
        this._heightService.toggleHeightWithTransition(childUlElement, parentLIElement, CollapsibleMenu.LI_EXPANDED_CLASS);
        event.preventDefault();
        // If event propogates, every parent li.expandable's click listener will
        // be called
        event.stopImmediatePropagation();
    }

    // Restore collapsable menu to inital state. Depth first search in post-order since child elements must be assigned their height values
    // before animations are started for parent elements (parent elements need to know how much to grow).
    private restoreLIElementsPreFilterStateAndHeight(ulElement: HTMLUListElement, allParentsAlreadyExpanded: boolean): void {
        let childLIElements = ulElement.children;
        for (let i = 0; i < childLIElements.length; i++) {
            let childLIElement = childLIElements[i] as HTMLLIElement;
            let childLIElementClassList = childLIElement.classList;

            // Reset
            // TODO consider calling in transition end callback when we toggle height with transition. Resetting immediately makes 
            // all elements visible.
            this.resetLIElementFilterState(childLIElementClassList);

            let childULElement = childLIElement.querySelector('ul');

            // Leaves don't need their heights toggled
            if (childULElement) {
                let alreadyExpanded = childLIElementClassList.contains(CollapsibleMenu.LI_EXPANDED_CLASS);
                let preExpanded = childLIElementClassList.contains(CollapsibleMenu.LI_PRE_EXPANDED_CLASS);

                childLIElementClassList.remove(CollapsibleMenu.LI_PRE_EXPANDED_CLASS)

                this.restoreLIElementsPreFilterStateAndHeight(childULElement, allParentsAlreadyExpanded && alreadyExpanded);

                if (preExpanded && !alreadyExpanded) {
                    if (allParentsAlreadyExpanded) {
                        this._heightService.toggleHeightWithTransition(childULElement, childLIElement, CollapsibleMenu.LI_EXPANDED_CLASS);
                    } else {
                        this._heightService.toggleHeightWithoutTransition(childULElement, childLIElement, CollapsibleMenu.LI_EXPANDED_CLASS);
                    }
                }
                else if (!preExpanded && alreadyExpanded) {
                    this._heightService.toggleHeightWithTransition(childULElement, childLIElement, CollapsibleMenu.LI_EXPANDED_CLASS);
                }
            }
        }
    }

    private savePreFilterState(): void {
        let preExpandedLIs = this.
            _rootElement.
            querySelectorAll('.' + CollapsibleMenu.LI_EXPANDED_CLASS);

        for (let i = 0; i < preExpandedLIs.length; i++) {
            preExpandedLIs[i].classList.add(CollapsibleMenu.LI_PRE_EXPANDED_CLASS);
        }
    }

    private resetLIElementFilterState(liElementClassList: DOMTokenList): void {
        liElementClassList.remove(CollapsibleMenu.LI_FILTER_HIDDEN_CLASS, CollapsibleMenu.LI_FILTER_EXPANDED_CLASS, CollapsibleMenu.LI_FILTER_MATCH_CLASS);
    }
}