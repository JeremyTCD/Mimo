import '../node_modules/mark.js/dist/jquery.mark'; // Use relative path since mark.js has multiple dist files

import Component from './component';
import paginationService from './paginationService';

class SearchResultsComponent extends Component {
    searchResultsElement: HTMLElement;
    searchResultsMessageElement: HTMLSpanElement;
    searchStringMessageElement: HTMLSpanElement;
    articleListElement: HTMLElement;
    paginationParentElements: NodeList;
    itemsParentElement: HTMLElement;

    protected canInitialize(): boolean {
        this.searchResultsElement = document.getElementById('search-results');

        return this.searchResultsElement ? true : false;
    }

    protected setup(): void {
        this.articleListElement = this.searchResultsElement.querySelector('.article-list') as HTMLElement;
        this.searchResultsMessageElement = document.querySelector('#search-results > .container > span') as HTMLSpanElement;
        this.searchStringMessageElement = document.querySelector('#search-string > .container > span') as HTMLSpanElement;
        this.paginationParentElements = this.searchResultsElement.querySelectorAll('.al-pagination');
        this.itemsParentElement = this.searchResultsElement.querySelector('.al-items') as HTMLElement;
    }

    protected registerListeners(): void {
    }

    public setShown(shown: boolean) {
        if (shown) {
            $('.hide-on-search').css('display', 'none');
            $('#search-results').css('display', 'flex');
        } else {
            $('.hide-on-search').css('display', 'flex');
            $('#search-results').css('display', 'none');

            // Resize or scroll may have occurred while 'body > .container' was hidden.
            // Components that react to scroll/resize events must have their listeners executed
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('scroll'));
        }
    }

    public setSnippets = (snippets: string[], queryString: string) : void => {
        let numPerPage = 5;

        $(this.paginationParentElements).twbsPagination('destroy');

        if (snippets.length === 0) {
            this.itemsParentElement.innerHTML = '';
            this.searchStringMessageElement.textContent = `No results found for "${queryString}" ...`;
            this.searchResultsMessageElement.textContent = `Your search - "${queryString}" - did not match any articles`;
        } else {
            this.searchStringMessageElement.textContent = `Search results for "${queryString}" ...`;
            this.searchResultsMessageElement.textContent = '';

            paginationService.setupPagination(
                this.articleListElement,
                this.paginationParentElements,
                this.itemsParentElement,
                snippets,
                () => {
                    let marked: string[] = [];
                    
                    queryString.
                        split(/\s+/).
                        forEach((word: string) => {
                            if (word !== '' && marked.indexOf(word) === -1) {
                                $(this.itemsParentElement).mark(word);
                                marked.push(word);
                            }
                        });
                })
        }

        this.setShown(true);
    }
}

export default new SearchResultsComponent();