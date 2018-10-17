import { injectable } from 'inversify';
import CollapsibleMenu from './collapsibleMenu';
import StringService from './stringService';
import HeightService from './heightService';

@injectable()
export default class CollapsibleMenuFactory {
    private _stringService: StringService;
    private _heightService: HeightService;

    public constructor(
        stringService: StringService,
        heightService: HeightService) {

        this._stringService = stringService;
        this._heightService = heightService;
    }

    public build(rootElement: HTMLElement): CollapsibleMenu {
        let rootElementID = rootElement.getAttribute('id');
        let rootLIElements = document.querySelectorAll(`#${rootElementID} > ul > li`);
        let expandableTextElements = document.querySelectorAll(`#${rootElementID} li.expandable > span, #${rootElementID} li.expandable > a`);
        let leafTextElements = document.querySelectorAll(`#${rootElementID} li > span, #${rootElementID} li > a`);

        this.setTextElementsPadding(leafTextElements, 21); // Leaf text elements have no icon, so we need extra padding to align them with expandable text elements
        this.setTextElementsPadding(expandableTextElements);
        this.registerTopicListeners(expandableTextElements);

        return new CollapsibleMenu(rootElement, rootLIElements, this._stringService, this._heightService);
    }

    private registerTopicListeners(topicElements: NodeList): void {
        for (let i = 0; i < topicElements.length; i++) {
            let topicElement = topicElements[i] as HTMLElement;

            topicElement.addEventListener('click', (event: Event) => {
                let parentLI = topicElement.parentElement;
                let childUl = parentLI.querySelector('ul');
                this._heightService.toggleHeightWithTransition(childUl, parentLI);
                event.preventDefault();
                // If event propogates, every parent li.expandable's click listener will
                // be called
                event.stopPropagation();
            });
        }
    }

    private setTextElementsPadding(textElements: NodeList, extraPaddingLeft: number = 0): void {
        for (let i = 0; i < textElements.length; i++) {
            let element = textElements[i] as HTMLElement;
            let level = parseInt(element.getAttribute('data-level'));

            element.style.paddingLeft = `${extraPaddingLeft + (level - 1) * 14}px`;
        }
    }
}