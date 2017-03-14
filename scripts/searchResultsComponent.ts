import Component from './component';

class SearchResultsComponent extends Component {
    protected canInitialize(): boolean {
        return true;
    }

    protected setup(): void {
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

    public setSnippets(snippets: string[], queryString: string) {
        let numPerPage = 5;

        $('#search-results .article-list > .al-pagination').empty();
        $('#search-results .article-list > .al-pagination').removeData("twbs-pagination");
        if (snippets.length === 0) {
            $('#search-results .article-list > .al-items').empty();
            $('#search-string .container > span').text(`No results found for "${queryString}"`);
            $('#search-results > .container > span').text(`Your search - "${queryString}" - did not match any documents`);
        } else {
            $('#search-results > .container > span').text('');
            $('#search-string .container > span').text(`Search results for "${queryString}"`);
            $('#search-results .article-list > .al-pagination').
                twbsPagination({
                    totalPages: Math.ceil(snippets.length / numPerPage),
                    visiblePages: 5,
                    onPageClick: (event, page) => {
                        let start = (page - 1) * numPerPage;
                        let currentSnippets = snippets.slice(start, start + numPerPage);
                        $('#search-results .article-list > .al-items').
                            empty().
                            append(currentSnippets);
                        queryString.
                            split(/\s+/).
                            forEach((word: string) => {
                                if (word !== '') {
                                    $('#search-results .article-list > .al-items *').mark(word);
                                }
                            });
                    }
                });
        }

        this.setShown(true);
    }
}

export default new SearchResultsComponent();