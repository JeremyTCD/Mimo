import Component from './component';
import PaginationService from './paginationService';

class SearchResultsComponent extends Component {
    searchResultsElement: HTMLElement;
    searchResultsMessageElement: HTMLSpanElement;
    searchStringMessageElement: HTMLSpanElement;
    paginationParentElement: HTMLElement;
    itemsParentElement: HTMLElement;

    protected canInitialize(): boolean {
        this.searchResultsElement = document.getElementById('search-results');

        return this.searchResultsElement ? true : false;
    }

    protected setup(): void {
        this.searchResultsMessageElement = document.querySelector('#search-results > .container > span') as HTMLSpanElement;
        this.searchStringMessageElement = document.querySelector('#search-string > .container > span') as HTMLSpanElement;
        this.paginationParentElement = this.searchResultsElement.querySelector('.al-pagination') as HTMLElement;
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
            $(window).trigger('scroll');
            $(window).trigger('resize');
        }
    }

    public setSnippets = (snippets: string[], queryString: string) : void => {
        let numPerPage = 5;

        $(this.paginationParentElement).twbsPagination('destroy');

        if (snippets.length === 0) {
            this.itemsParentElement.innerHTML = '';
            this.searchStringMessageElement.textContent = `No results found for "${queryString}" ...`;
            this.searchResultsMessageElement.textContent = `Your search - "${queryString}" - did not match any articles`;
        } else {
            this.searchStringMessageElement.textContent = `Search results for "${queryString}" ...`;
            this.searchResultsMessageElement.textContent = '';

            PaginationService.setupPagination(
                this.paginationParentElement,
                this.itemsParentElement,
                snippets,
                () => {
                    queryString.
                        split(/\s+/).
                        forEach((word: string) => {
                            if (word !== '') {
                                $(this.itemsParentElement).mark(word);
                            }
                        });
                })
        }

        this.setShown(true);
    }
}

export default new SearchResultsComponent();