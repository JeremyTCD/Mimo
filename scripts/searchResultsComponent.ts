import * as Mark from 'mark.js';
import Component from './component';
import paginationService from './paginationService';
import leftMenuComponent from './leftMenuComponent';
import rightMenuComponent from './rightMenuComponent';

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

            // Reset
            this.itemsParentElement.innerHTML = '';
            $(this.paginationParentElements).twbsPagination('destroy');

            // While search results are displayed, main container (including left and right menu) have their dispay set to none.
            // This means that left and right menu cannot be updated on resize/scroll since they rely on getBoundingClientRect
            // which is meaningles when they are not displayed. Therefore, just before re-displaying main container, left and 
            // right menu must be updated. 
            leftMenuComponent.updateLeftMenu();
            rightMenuComponent.setRightMenuDomLocation();
            rightMenuComponent.updateRightMenu();
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
                                var target = new Mark(this.itemsParentElement);
                                target.mark(word);
                                marked.push(word);
                            }
                        });
                })
        }

        this.setShown(true);
    }
}

export default new SearchResultsComponent();