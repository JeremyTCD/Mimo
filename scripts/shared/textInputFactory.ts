import { injectable } from 'inversify';
import TextInput from './textInput';

@injectable()
export default class TextInputFactory {
    public build(wrapperElement: HTMLElement,
        inputElement: HTMLInputElement,
        clearElement: HTMLElement,
        onResetInput: () => void): TextInput {

        return new TextInput(wrapperElement, inputElement, clearElement, onResetInput);
    }
}