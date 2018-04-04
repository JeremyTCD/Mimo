import { injectable } from 'inversify';

@injectable()
export default class PathService {
    public getAbsolutePath(href: string): string {
        // Use anchor to normalize href
        let anchor = $('<a href="' + href + '"></a>')[0] as HTMLAnchorElement;
        // Ignore protocal, remove search and query
        return anchor.host + anchor.pathname;
    }

    public isRelativePath(href: string): boolean {
        return !this.isAbsolutePath(href);
    }

    public isAbsolutePath(href: string): boolean {
        return (/^(?:[a-z]+:)?\/\//i).test(href);
    }

    public getDirectory(href: string): string {
        if (!href)
            return '';
        let index = href.lastIndexOf('/');
        if (index == -1)
            return '';
        if (index > -1) {
            return href.substr(0, index);
        }
    }
}
