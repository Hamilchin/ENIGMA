import { textSpeed } from '../config';
import { sleep } from '../utils';
import { UiList } from './UiList';
import { UiText } from './UiText';

export async function slowDisplayText(list: UiList, msg: string) {
  const lines = msg.split('\n');
  for (const line of lines) {
    const text = new UiText(0, 0, '', 3, [true, false]);
    list.add(text);
    for (let i = 0; i < line.length; i++) {
      text.text = text._text + line[i];
      await sleep(textSpeed);
    }
    list.elements.pop();
    list.add(text.toImage());
  }
}
