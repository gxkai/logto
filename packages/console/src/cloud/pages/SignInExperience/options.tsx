import { SignInIdentifier } from '@logto/schemas';

import Envelop from '@/assets/images/envelop.svg';
import Keyboard from '@/assets/images/keyboard.svg';
import Label from '@/assets/images/label.svg';
import Lock from '@/assets/images/lock.svg';
import Mobile from '@/assets/images/mobile.svg';
import type { Option as SelectorOption } from '@/cloud/components/CardSelector';
import { Authentication } from '@/cloud/types';

export const identifierOptions: SelectorOption[] = [
  {
    icon: <Envelop />,
    title: 'sign_in_exp.sign_up_and_sign_in.identifiers_email',
    value: SignInIdentifier.Email,
  },
  {
    icon: <Mobile />,
    title: 'sign_in_exp.sign_up_and_sign_in.identifiers_phone',
    value: SignInIdentifier.Phone,
  },
  {
    icon: <Label />,
    title: 'sign_in_exp.sign_up_and_sign_in.identifiers_username',
    value: SignInIdentifier.Username,
  },
];

export const authenticationOptions: SelectorOption[] = [
  {
    icon: <Lock />,
    title: 'sign_in_exp.sign_up_and_sign_in.sign_in.password_auth',
    value: Authentication.Password,
  },
  {
    icon: <Keyboard />,
    title: 'sign_in_exp.sign_up_and_sign_in.sign_in.verification_code_auth',
    value: Authentication.VerificationCode,
  },
];
