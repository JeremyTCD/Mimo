import svgService from './svgService';

class PaginationService {
    public setupPagination(
        paginationParentElement: HTMLElement,
        itemsParentElement: HTMLElement,
        items: NodeList | HTMLElement[] | string[],
        onDomReady: () => void = null,
        numPerPage: number = 5,
        numPageButtons: number = 5): void {

        let firstIcon = svgService.createSvgExternalSpriteElement('material-design-first-page');
        let previousIcon = svgService.createSvgExternalSpriteElement('material-design-previous-page');
        let nextIcon = svgService.createSvgExternalSpriteElement('material-design-next-page');
        let lastIcon = svgService.createSvgExternalSpriteElement('material-design-last-page');

        $(paginationParentElement).
            twbsPagination({
                first: ' ',
                prev: ' ',
                next: ' ',
                last: ' ',
                totalPages: Math.ceil(items.length / numPerPage),
                visiblePages: numPageButtons,
                onPageClick: (event, page) => {
                    let start = (page - 1) * numPerPage;
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

                    paginationParentElement.
                        querySelector('.first > a').
                        appendChild(firstIcon);

                    paginationParentElement.
                        querySelector('.prev > a').
                        appendChild(previousIcon);

                    paginationParentElement.
                        querySelector('.next > a').
                        appendChild(nextIcon);

                    paginationParentElement.
                        querySelector('.last > a').
                        appendChild(lastIcon);

                    if (onDomReady) {
                        onDomReady();
                    }
                }
            });
    }
}

export default new PaginationService();