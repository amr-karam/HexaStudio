import { en } from './en';
import { ar } from './ar';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { ja } from './ja';
import { ko } from './ko';
import { zh } from './zh';
import { Locale } from '../config';

export type Messages = typeof en;

const messageMap: Record<string, Messages> = {
  en,
  ar,
  es,
  fr,
  de,
  ja,
  ko,
  zh,
};

export function getMessages(locale: Locale): Messages {
  return messageMap[locale] || en;
}
