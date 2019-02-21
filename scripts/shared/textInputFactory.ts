import { injectable } from 'inversify';
import TextInput from './textInput';

@injectable()
export default class TextInputFactory {
    public build(textInputElement: HTMLFormElement,
        onInput: (value: string) => void,
        onReset?: () => void): TextInput {

        return new TextInput(textInputElement, onInput, onReset);
    }
}