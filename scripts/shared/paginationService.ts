import { injectable } from 'inversify';

@injectable()
export default class PaginationService {
    public setupPagination(
        buttonsParentElement: HTMLUListElement,
        itemsParentElement: HTMLElement,
        items: NodeList | HTMLElement[] | string[],
        onDomReady: () => void = null,
        numPerPage: number = 5,
        numPageButtons: number = 5): void {

        // Check if setup before with other items
        let setupBefore = buttonsParentElement.children.length > 2;

        // Calculate number of pages
        let numPages = Math.ceil(items.length / numPerPage);

        // Current page number
        let currentPageNumber = 1;

        // Page buttons
        numPageButtons = Math.min(numPages, numPageButtons);
        let pageButtonElements: HTMLLIElement[] = [];
        let masterAnchorElement = document.createElement('a');
        masterAnchorElement.setAttribute('href', '#'); // Ensures that pages scrolls to top on click
        let masterPageButton = document.createElement('li');
        masterPageButton.appendChild(masterAnchorElement);

        // Pagination buttons
        let prevButtonElement: HTMLLIElement = buttonsParentElement.querySelector('.pagination-prev');
        let nextButtonElement: HTMLLIElement = buttonsParentElement.querySelector('.pagination-next');

        if (setupBefore) {
            // Reset if setup before
            prevButtonElement = prevButtonElement.cloneNode(true) as HTMLLIElement; // Clone to get rid of existing listeners
            nextButtonElement = nextButtonElement.cloneNode(true) as HTMLLIElement; // Clone to get rid of existing listeners
            buttonsParentElement.innerHTML = ''; // Clear existing buttons
            buttonsParentElement.appendChild(prevButtonElement);
            buttonsParentElement.appendChild(nextButtonElement);
        }

        prevButtonElement.
            querySelector('a').
            addEventListener('click', () => {
                currentPageNumber = currentPageNumber > 1 ? currentPageNumber - 1 : 1;
                this.render(currentPageNumber, numPerPage, items, itemsParentElement, pageButtonElements, prevButtonElement, nextButtonElement, onDomReady);
            });

        nextButtonElement.
            querySelector('a').
            addEventListener('click', () => {
                currentPageNumber = currentPageNumber < numPages ? currentPageNumber + 1 : numPages;
                this.render(currentPageNumber, numPerPage, items, itemsParentElement, pageButtonElements, prevButtonElement, nextButtonElement, onDomReady);
            });

        for (let j = 0; j < numPageButtons; j++) {
            let pageButtonElement = masterPageButton.cloneNode(true) as HTMLLIElement;
            pageButtonElement.querySelector('a').addEventListener('click', (event: MouseEvent) => {
                currentPageNumber = parseInt((event.currentTarget as HTMLAnchorElement).textContent);
                this.render(currentPageNumber, numPerPage, items, itemsParentElement, pageButtonElements, prevButtonElement, nextButtonElement, onDomReady);
            });
            pageButtonElements.push(pageButtonElement);
            buttonsParentElement.insertBefore(pageButtonElement, nextButtonElement);
        }

        // Initial render
        this.render(currentPageNumber, numPerPage, items, itemsParentElement, pageButtonElements, prevButtonElement, nextButtonElement, onDomReady);
    }

    private render(
        pageNum: number,
        numPerPage: number,
        items: NodeList | HTMLElement[] | string[],
        itemsParentElement: HTMLElement,
        pageButtonElements: HTMLLIElement[],
        prevButtonElement: HTMLLIElement,
        nextButtonElement: HTMLLIElement,
        onDomReady: () => void = null) {

        // Snippets
        let start = (pageNum - 1) * numPerPage;
        let currentSnippets = [].slice.call(items, start, start + numPerPage);
        itemsParentElement.innerHTML = '';
        for (let i = 0; i < currentSnippets.length; i++) {
            let snippet = currentSnippets[i];

            if (typeof snippet === 'string') {
                itemsParentElement.appendChild(document.createRange().createContextualFragment(snippet));
            }
            else {
                itemsParentElement.appendChild(snippet);
            }
        }

        // Buttons
        let numPages = Math.ceil(items.length / numPerPage);
        let numButtons = pageButtonElements.length;
        let middleButtonNum = Math.round(numButtons / 2);
        // First button number
        let firstButtonNum = 0;
        if (pageNum < middleButtonNum) {
            firstButtonNum = 1;
        } else if (numPages - pageNum < middleButtonNum) {
            firstButtonNum = numPages - numButtons + 1;
        } else {
            firstButtonNum = pageNum - middleButtonNum + 1;
        }
        // Prev/next buttons
        if (pageNum == 1) {
            prevButtonElement.classList.add('disabled');
        }
        else {
            prevButtonElement.classList.remove('disabled');
        }
        if (pageNum == numPages) {
            nextButtonElement.classList.add('disabled');
        }
        else {
            nextButtonElement.classList.remove('disabled');
        }

        for (let i = 0; i < numButtons; i++) {
            let buttonNum = firstButtonNum + i;
            let pageButtonElement = pageButtonElements[i];

            if (buttonNum == pageNum) {
                pageButtonElement.classList.add('active');
            } else {
                pageButtonElement.classList.remove('active');
            }

            pageButtonElement.querySelector('a').textContent = buttonNum.toString();
        }

        if (onDomReady) {
            onDomReady();
        }
    }
}