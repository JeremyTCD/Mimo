import 'twbs-pagination';

class ArticleListBuilder {
    build() {
        let numPerPage = 3;
        let allAlItems = $('.al-items-all > .al-item');

        if (allAlItems.length == 0) {
            return;
        }

        $('#al-pagination > ul').twbsPagination({
            totalPages: Math.ceil(allAlItems.length / numPerPage),
            visiblePages: 5,
            onPageClick: function (event: any, page: number) {
                let start = (page - 1) * numPerPage;
                let currentAlItems = allAlItems.slice(start, start + numPerPage);
                $('#al-items-current').empty().append(currentAlItems);
            }
        })
    }
}

export default new ArticleListBuilder();