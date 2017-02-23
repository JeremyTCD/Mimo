import { generateMultiLevelList, ListItem } from './utils';

class BreadcrumbsBuilder {
    breadcrumbs: ListItem[] = [];
    rootBreadcrumbLoaded: boolean = false;
    childBreadcrumbsLoaded: boolean = false;

    build() {
        let html = generateMultiLevelList(this.breadcrumbs,
            'breadcrumb',
            1);
        $('#breadcrumbs>.container').html(html);
    }

    loadRootBreadCrumb(anchorElement: HTMLAnchorElement) {
        if (!this.rootBreadcrumbLoaded) {
            this.breadcrumbs.unshift({
                href: anchorElement.href,
                name: anchorElement.innerHTML,
                items: null
            });

            this.rootBreadcrumbLoaded = true;
            this.build();
        }
    }

    loadChildBreadcrumbs(anchorElements: HTMLAnchorElement[]) {
        if (!this.childBreadcrumbsLoaded) {
            for (let i = anchorElements.length - 1; i >= 0; i--) {
                this.breadcrumbs.push({
                    href: anchorElements[i].href,
                    name: anchorElements[i].innerHTML,
                    items: null
                });
            }

            this.childBreadcrumbsLoaded = true;
            this.build();
        }
    }
}

export default new BreadcrumbsBuilder();

