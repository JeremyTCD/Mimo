import 'twbs-pagination';

class SortedArticleList{
    build() {
        let numPerPage = 3;
        let allAlItems = $('#sal-all-items > article');

        if (allAlItems.length == 0) {
            return;
        }

        $('#sorted-article-list > .article-list > .al-pagination').twbsPagination({
            totalPages: Math.ceil(allAlItems.length / numPerPage),
            visiblePages: 5,
            onPageClick: function (event: any, page: number) {
                let start = (page - 1) * numPerPage;
                let currentAlItems = allAlItems.slice(start, start + numPerPage);
                $('#sorted-article-list > .article-list > .al-items').empty().append(currentAlItems);
            }
        })
    }
}

export default new SortedArticleList();