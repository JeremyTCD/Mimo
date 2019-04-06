import { injectable } from 'inversify';
import Component from '../shared/component';
import TooltipService from '../shared/tooltipService';
import * as Clipboard from 'clipboard';
import CodeService from '../shared/codeService';

@injectable()
export default class MainArticleComponent implements Component {
    private _mainArticleElement: HTMLElement;

    public constructor(private _tooltipService: TooltipService,
        private _codeService: CodeService) {
    }

    public enabled(): boolean {
        // Always exists
        return true;
    }

    public setupOnDomInteractive(): void {
        this._codeService.setupCodeBlocks();
        this._mainArticleElement = document.querySelector('.main-article') as HTMLElement;

        this.setupSectionHeaderLinks();
        this.setupVideoPlayButtons();
    }

    public setupOnLoad(): void {
        // Do nothing
    }

    private setupSectionHeaderLinks(): void {
        let sectionElements: NodeList = this._mainArticleElement.querySelectorAll('section[class*="flexi-section-block-"]');

        for (let i: number = 0; i < sectionElements.length; i++) {
            let sectionElement = sectionElements[i] as HTMLElement;
            let buttonElement = sectionElement.querySelector('button');
            let id = sectionElement.getAttribute('id');
            let href = `${location.protocol}//${location.host}${location.pathname}#${id}`;

            // Clipboard for button
            buttonElement.setAttribute('data-clipboard-text', href);
            new Clipboard(buttonElement);

            // 'Popup' for button
            this._tooltipService.setupElement(buttonElement, 'right', 'Link copied');
        }
    }

    private setupVideoPlayButtons(): void {
        let videoElements: NodeList = this._mainArticleElement.querySelectorAll('video');

        for (let i: number = 0; i < videoElements.length; i++) {
            let videoElement = videoElements[i] as HTMLVideoElement;
            let figureElement = videoElement.parentElement;

            if (figureElement.tagName != "FIGURE") {
                continue;
            }

            let playButton = figureElement.querySelector('.play');
            let pauseButton = figureElement.querySelector('.pause');

            if (!playButton || !pauseButton) {
                continue;
            }

            figureElement.addEventListener('mouseenter', () => {
                figureElement.classList.add('hover');
            });

            figureElement.addEventListener('mouseleave', (event: MouseEvent) => {
                // TODO remove once chromium is fixed - https://stackoverflow.com/questions/45266854/mouseleave-triggered-by-click
                // Note: when the chromium bug is fixed, :hover might work? Right now the :hover pseudo class vanishes randomly
                // if you click fast.
                if (!event.relatedTarget && !event.toElement) {
                    return;
                }

                figureElement.classList.remove('hover');
            });

            playButton.addEventListener('click', () => {
                playButton.classList.remove('enabled');
                pauseButton.classList.add('enabled');
                videoElement.play();
            });

            pauseButton.addEventListener('click', () => {
                pauseButton.classList.remove('enabled');
                playButton.classList.add('enabled');
                videoElement.pause();
            });

            videoElement.addEventListener('click', () => {
                pauseButton.classList.toggle('enabled');
                playButton.classList.toggle('enabled');

                if (playButton.classList.contains('enabled')) {
                    videoElement.pause();
                } else {
                    videoElement.play();
                }
            });
        }
    }
}