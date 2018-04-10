import { injectable } from 'inversify';
import Component from '../shared/component';
import PathService from '../shared/pathService';

@injectable()
export default class NavbarComponent implements Component {
    private _pathService: PathService;
    private _navbarElement: HTMLElement;

    public constructor(pathService: PathService) {
        this._pathService = pathService;
    }

    public setupImmediate(): void {
        // Do nothing
    }

    public setupOnDomContentLoaded(): void {
        this._navbarElement = document.getElementById('page-header-navbar');
        this.setupNavbar();
    }

    public setupOnLoad(): void {
        // Do nothing
    }

    private setupNavbar() {
        let navbarPath = document.querySelector("meta[property='docfx\\:navrel']").getAttribute('content');

        if (navbarPath) {
            navbarPath = navbarPath.replace(/\\/g, '/');
        }

        let getNavbarRequest = new XMLHttpRequest()
        getNavbarRequest.onreadystatechange = () => {
            // TODO check status too
            if (getNavbarRequest.readyState === XMLHttpRequest.DONE) {
                let tocFrag = document.createRange().createContextualFragment(getNavbarRequest.responseText);
                this._navbarElement.appendChild(tocFrag);

                this.setNavbarActiveTopic(navbarPath);
            }
        }
        getNavbarRequest.open('GET', navbarPath)
        getNavbarRequest.send()
    }

    private setNavbarActiveTopic(navbarPath: string): void {
        let tocPath = document.querySelector("meta[property='docfx\\:tocrel']").getAttribute('content');

        if (tocPath) {
            tocPath = tocPath.replace(/\\/g, '/');
        }
        let index = navbarPath.lastIndexOf('/');
        let navRel = '';
        if (index > -1) {
            navRel = navbarPath.substr(0, index + 1);
        }
        let currentAbsPath = this._pathService.getAbsolutePath(window.location.pathname);

        let navbarAnchorElements = this._navbarElement.querySelectorAll('a[href]');

        for (let i = 0; i < navbarAnchorElements.length; i++) {
            let anchorElement = navbarAnchorElements[i] as HTMLAnchorElement;
            let href = anchorElement.getAttribute('href');

            if (this._pathService.isRelativePath(href)) {
                href = navRel + href;
                anchorElement.setAttribute('href', href);

                let isActive = false;
                let originalHref = anchorElement.name;
                if (originalHref) {
                    originalHref = navRel + originalHref;
                    if (this._pathService.getDirectory(this._pathService.getAbsolutePath(originalHref)) === this._pathService.getDirectory(this._pathService.getAbsolutePath(tocPath))) {
                        isActive = true;
                    }
                } else {
                    if (this._pathService.getAbsolutePath(href) === currentAbsPath) {
                        isActive = true;
                    }
                }
                if (isActive) {
                    anchorElement.parentElement.classList.add('active');
                } else {
                    anchorElement.parentElement.classList.remove('active')
                }
            }
        }
    }
}