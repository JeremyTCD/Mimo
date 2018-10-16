import { injectable } from 'inversify';

@injectable()
export default class PathService {
    public getAbsolutePath(href: string): string {
        // Use anchor to normalize href
        let anchorElement = document.createElement('a');
        anchorElement.setAttribute('href', href);

        // Ignore protocol, remove search and query
        return anchorElement.host + anchorElement.pathname;
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
