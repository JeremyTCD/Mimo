import { injectable, inject } from 'inversify';

@injectable()
export default class SvgService {
    public createSvgExternalSpriteElement(id: string): SVGElement{
        let svgns = 'http://www.w3.org/2000/svg';
        let xlinkns = 'http://www.w3.org/1999/xlink';
        let svgElement: SVGElement = document.createElementNS(svgns, 'svg') as SVGElement;
        let useElement: SVGUseElement = document.createElementNS(svgns, 'use') as SVGUseElement;

        useElement.setAttributeNS(xlinkns, 'xlink:href', `#${id}`);
        svgElement.appendChild(useElement);

        return svgElement;
    }
}